import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import EditTaskForm from './EditTaskForm';

export default async function EditTaskPage({ params }: { params: { taskId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { taskId } = await params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    redirect('/tasks');
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return <EditTaskForm task={task} users={users} />;
} 