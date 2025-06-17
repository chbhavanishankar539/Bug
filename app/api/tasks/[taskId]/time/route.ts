import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get all time entries for a task
export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: {
        assignee: true,
        creator: true,
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Check if user has permission to view time entries
    const isManager = session.user.role === 'MANAGER';
    const isAssignee = task.assignee.email === session.user.email;
    const isCreator = task.creatorId === session.user.id;

    if (!isManager && !isAssignee && !isCreator) {
      return new NextResponse('Not authorized to view time entries', { status: 403 });
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: { taskId: params.taskId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Create a new time entry
export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: {
        assignee: true,
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Only assignee can log time
    if (task.assignee.email !== session.user.email) {
      return new NextResponse('Only the assignee can log time', { status: 403 });
    }

    const body = await request.json();
    const { startTime, endTime, description } = body;

    const timeEntry = await prisma.timeEntry.create({
      data: {
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        description,
        userId: session.user.id,
        taskId: params.taskId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update a time entry
export async function PUT(
  request: Request,
  { params: _params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, startTime, endTime, description } = body;

    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            assignee: true,
          },
        },
      },
    });

    if (!timeEntry) {
      return new NextResponse('Time entry not found', { status: 404 });
    }

    // Only assignee can update their time entries
    if (timeEntry.task.assignee.email !== session.user.email) {
      return new NextResponse('Only the assignee can update time entries', { status: 403 });
    }

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        description,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTimeEntry);
  } catch (error) {
    console.error('Error updating time entry:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Delete a time entry
export async function DELETE(
  request: Request,
  { params: _params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const timeEntryId = searchParams.get('id');

    if (!timeEntryId) {
      return new NextResponse('Time entry ID is required', { status: 400 });
    }

    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
      include: {
        task: {
          include: {
            assignee: true,
          },
        },
      },
    });

    if (!timeEntry) {
      return new NextResponse('Time entry not found', { status: 404 });
    }

    // Only assignee can delete their time entries
    if (timeEntry.task.assignee.email !== session.user.email) {
      return new NextResponse('Only the assignee can delete time entries', { status: 403 });
    }

    await prisma.timeEntry.delete({
      where: { id: timeEntryId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 