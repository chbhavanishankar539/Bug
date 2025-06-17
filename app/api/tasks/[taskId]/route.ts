import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { taskId } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { taskId } = await params;

  try {
    const body = await request.json();
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        creator: true,
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Check permissions based on user role and task status
    const isManager = session.user.role === 'MANAGER';
    const isAssignee = task.assignee.email === session.user.email;

    // Handle status changes
    if (body.status && body.status !== task.status) {
      // Status change rules
      switch (body.status) {
        case 'PENDING_APPROVAL':
          // Only assignee can mark as pending approval
          if (!isAssignee) {
            return new NextResponse('Only the assignee can mark a task as pending approval', { status: 403 });
          }
          // Can only mark as pending approval if task is in progress
          if (task.status !== 'IN_PROGRESS') {
            return new NextResponse('Can only mark tasks in progress as pending approval', { status: 400 });
          }
          break;

        case 'CLOSED':
          // Only manager can close a task
          if (!isManager) {
            return new NextResponse('Only managers can close tasks', { status: 403 });
          }
          // Can only close tasks that are pending approval
          if (task.status !== 'PENDING_APPROVAL') {
            return new NextResponse('Can only close tasks that are pending approval', { status: 400 });
          }
          break;

        case 'REOPENED':
          // Only manager can reopen a task
          if (!isManager) {
            return new NextResponse('Only managers can reopen tasks', { status: 403 });
          }
          // Can only reopen tasks that are pending approval
          if (task.status !== 'PENDING_APPROVAL') {
            return new NextResponse('Can only reopen tasks that are pending approval', { status: 400 });
          }
          break;

        case 'IN_PROGRESS':
          // Only assignee can start progress
          if (!isAssignee) {
            return new NextResponse('Only the assignee can start progress on a task', { status: 403 });
          }
          // Can only start progress on open tasks
          if (task.status !== 'OPEN') {
            return new NextResponse('Can only start progress on open tasks', { status: 400 });
          }
          break;

        case 'OPEN':
          // Only assignee or manager can reopen a task
          if (!isAssignee && !isManager) {
            return new NextResponse('Only the assignee or manager can reopen a task', { status: 403 });
          }
          // Can only reopen tasks that are in progress
          if (task.status !== 'IN_PROGRESS') {
            return new NextResponse('Can only reopen tasks that are in progress', { status: 400 });
          }
          break;

        default:
          return new NextResponse('Invalid status change', { status: 400 });
      }
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...body,
        status: body.status || task.status,
      },
      include: {
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { taskId } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Allow deletion if:
    // 1. User is a manager
    // 2. User is the creator of the task
    // 3. User is the assignee of the task
    const isManager = session.user.role === 'MANAGER';
    const isCreator = task.creatorId === session.user.id;
    const isAssignee = task.assignee.email === session.user.email;

    if (!isManager && !isCreator && !isAssignee) {
      return new NextResponse('Not authorized to delete this task', { status: 403 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 