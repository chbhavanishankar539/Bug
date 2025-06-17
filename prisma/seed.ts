import { PrismaClient, UserRole, TaskPriority, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@fealtyx.com' },
    update: {},
    create: {
      email: 'manager@fealtyx.com',
      name: 'Manager User',
      password: managerPassword,
      role: UserRole.MANAGER,
    },
  });

  // Create developer users
  const developerPassword = await bcrypt.hash('dev123', 10);
  const developer1 = await prisma.user.upsert({
    where: { email: 'dev1@fealtyx.com' },
    update: {},
    create: {
      email: 'dev1@fealtyx.com',
      name: 'Developer One',
      password: developerPassword,
      role: UserRole.DEVELOPER,
    },
  });

  const developer2 = await prisma.user.upsert({
    where: { email: 'dev2@fealtyx.com' },
    update: {},
    create: {
      email: 'dev2@fealtyx.com',
      name: 'Developer Two',
      password: developerPassword,
      role: UserRole.DEVELOPER,
    },
  });

  // Create sample tasks
  const tasks = [
    {
      title: 'Fix login page layout',
      description: 'The login page layout is broken on mobile devices',
      priority: TaskPriority.HIGH,
      status: TaskStatus.OPEN,
      assigneeId: developer1.id,
      creatorId: manager.id,
    },
    {
      title: 'Implement dark mode',
      description: 'Add dark mode support to the application',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      assigneeId: developer2.id,
      creatorId: manager.id,
    },
    {
      title: 'Add user profile page',
      description: 'Create a new page for users to view and edit their profile',
      priority: TaskPriority.LOW,
      status: TaskStatus.PENDING_APPROVAL,
      assigneeId: developer1.id,
      creatorId: manager.id,
    },
  ];

  // First, delete all existing tasks
  await prisma.task.deleteMany();

  // Then create new tasks
  for (const task of tasks) {
    await prisma.task.create({
      data: task,
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 