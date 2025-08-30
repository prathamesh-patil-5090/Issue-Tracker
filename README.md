# Issue Tracker App

A Notion-like issue tracker built with Next.js, Drizzle ORM, and Neon DB.

## Features

- User authentication with Google OAuth
- Kanban board with drag-and-drop functionality
- User-specific boards and issues
- Real-time issue creation and management
- Mobile-responsive design

## Quick Setup

1. **Clone and install:**

   ```bash
   git clone <your-repo-url>
   cd next-pratice
   pnpm install
   ```

2. **Environment setup:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Database setup:**

   ```bash
   pnpm db:push
   ```

4. **Development:**
   ```bash
   pnpm dev
   ```

## Environment Variables

Create a `.env.local` file with:

```bash
# Authentication (generate with: openssl rand -base64 32)
AUTH_SECRET=your_auth_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database
DATABASE_URL=your_neon_database_url_here

# Vercel deployment URL (after deployment)
NEXTAUTH_URL=https://your-app-name.vercel.app
```

## Vercel Deployment

### 1. Connect Repository

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository

### 2. Configure Environment Variables

In Vercel dashboard, add these environment variables:

- `AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
- `NEXTAUTH_URL` (set to your Vercel app URL)

### 3. Database Setup for Production

1. Update your Neon database to allow connections from `0.0.0.0/0` or Vercel's IP ranges
2. Ensure your database URL includes SSL parameters:
   ```
   postgresql://username:password@host/database?sslmode=require
   ```

### 4. Deploy

Vercel will automatically:

- Install dependencies
- Build the application
- Deploy to production

### 5. Update Google OAuth

After deployment, update your Google OAuth credentials:

1. Add your Vercel domain to authorized origins
2. Update redirect URIs to include: `https://your-app.vercel.app/api/auth/callback/google`

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js with Google OAuth
- **Drag & Drop**: @dnd-kit
- **Deployment**: Vercel

## Database Schema

- **boards**: User-specific Kanban boards
- **columns**: Columns within boards (To Do, In Progress, Done)
- **issues**: Individual tasks/issues

## API Routes

- `GET/POST /api/board` - Board management
- `GET/POST /api/issues` - Issue CRUD operations
- `PATCH/DELETE /api/issues/[id]` - Individual issue operations
- `GET/POST /api/columns` - Column management
- `DELETE /api/columns/[id]` - Delete columns

## Mobile Optimization

The app is fully responsive with:

- Touch-friendly drag and drop
- Optimized layouts for mobile screens
- Proper viewport configuration
- iOS-specific input handling

## Development Commands

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Database operations
pnpm db:generate
pnpm db:push
pnpm db:migrate

# Linting
pnpm lint
```
# Issue-Tracker
