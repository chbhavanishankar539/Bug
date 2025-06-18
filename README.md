# FealtyX Bug Tracker

A modern bug and task tracking application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- User authentication with role-based access control (Developer and Manager roles)
- Task/Bug management with status tracking
- Time tracking for tasks
- Dashboard with task statistics and trends
- Responsive design for desktop and mobile
- Real-time updates

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma (PostgreSQL)
- NextAuth.js
- Zustand (State Management)
- Recharts (Data Visualization)
- Headless UI (UI Components)

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- PostgreSQL database

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fealtyx-bug-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/bugtracker"
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

For production deployment, see [SETUP.md](./SETUP.md) for detailed instructions.

## Project Structure

```
fealtyx-bug-tracker/
├── app/
│   ├── api/              # API routes
│   ├── components/       # Reusable components
│   ├── lib/             # Utility functions and configurations
│   ├── store/           # Zustand store
│   ├── types/           # TypeScript type definitions
│   └── ...              # Page components
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── ...                  # Configuration files
```

## Features in Detail

### Authentication
- Role-based access control (Developer and Manager roles)
- Secure session management with NextAuth.js
- Protected routes and API endpoints

### Task Management
- Create, read, update, and delete tasks
- Assign tasks to developers
- Track task status (Open, In Progress, Pending Approval, Closed, Reopened)
- Set task priority (Low, Medium, High, Critical)
- Filter and sort tasks

### Time Tracking
- Start and stop time tracking for tasks
- View total time spent on tasks
- Track time entries with start and end times
- Calculate task duration

### Dashboard
- Overview of task statistics
- Task trend visualization
- Recent tasks list
- Quick access to important features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
