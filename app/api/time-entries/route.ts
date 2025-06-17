import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { taskId, startTime } = body;

    // Check if there's already an active time entry for this user
    const activeTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
    });

    if (activeTimeEntry) {
      return new NextResponse('You already have an active time entry', { status: 400 });
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId: session.user.id,
        startTime: new Date(startTime),
      },
    });

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: session.user.id,
        ...(taskId ? { taskId } : {}),
      },
      include: {
        task: {
          select: {
            title: true,
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