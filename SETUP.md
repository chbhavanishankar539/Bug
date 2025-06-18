# Production Setup Guide

## Environment Variables

Create a `.env` file in your production environment with the following variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database_name"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://yourdomain.com"
```

## Database Setup

1. **Set up PostgreSQL database:**
   - Create a PostgreSQL database
   - Update the DATABASE_URL with your database credentials
   - Run database migrations: `npx prisma db push`

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

## Common Issues

### 500 Error when creating tasks
This usually happens when:
- DATABASE_URL is not set or incorrect
- Database is not accessible
- Prisma client is not generated

### JSON parsing errors
The application now returns proper JSON error responses. If you still see JSON parsing errors, check:
- Database connection
- Environment variables
- Prisma client generation

## Deployment Checklist

- [ ] Set up PostgreSQL database
- [ ] Configure DATABASE_URL environment variable
- [ ] Set NEXTAUTH_SECRET and NEXTAUTH_URL
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Build the application: `npm run build`
- [ ] Start the application: `npm start` 