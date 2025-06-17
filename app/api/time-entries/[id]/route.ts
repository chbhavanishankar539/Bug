import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { endTime } = body;

    const timeEntry = await prisma.timeEntry.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!timeEntry) {
      return new NextResponse('Time entry not found', { status: 404 });
    }

    if (timeEntry.userId !== session.user.id) {
      return new NextResponse('Unauthorized to update this time entry', {
        status: 403,
      });
    }

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: {
        id: params.id,
      },
      data: {
        endTime: new Date(endTime),
        duration: Math.round(
          (new Date(endTime).getTime() - new Date(timeEntry.startTime).getTime()) /
            (1000 * 60)
        ),
      },
    });

    return NextResponse.json(updatedTimeEntry);
  } catch (error) {
    console.error('Error updating time entry:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 