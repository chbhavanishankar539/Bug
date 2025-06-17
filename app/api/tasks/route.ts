import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/lib/auth';
import { TaskStatus, UserRole } from '@prisma/client';
import { TaskPriority } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TaskStatus | null;
    const priority = searchParams.get('priority') as TaskPriority | null;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where = {
      ...(status && { status }),
      ...(priority && { priority }),
    };

    const orderBy = {
      [sortBy]: sortOrder,
    };

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
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
        timeEntries: true,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, assigneeId, dueDate } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status: 'OPEN',
        assigneeId,
        creatorId: session.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
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

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, priority, status, assigneeId, dueDate } = body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        creator: true,
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Only allow status changes if user is manager or the assigned developer
    if (status && status !== task.status) {
      if (
        session.user.role !== UserRole.MANAGER &&
        session.user.id !== task.assigneeId
      ) {
        return new NextResponse('Unauthorized to change status', { status: 403 });
      }

      // Only managers can approve/reopen tasks
      if (
        (status === TaskStatus.CLOSED || status === TaskStatus.REOPENED) &&
        session.user.role !== UserRole.MANAGER
      ) {
        return new NextResponse('Only managers can approve/reopen tasks', {
          status: 403,
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        status,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null,
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Task ID is required', { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Only allow deletion if user is manager or the creator
    if (
      session.user.role !== UserRole.MANAGER &&
      session.user.id !== task.creatorId
    ) {
      return new NextResponse('Unauthorized to delete task', { status: 403 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 