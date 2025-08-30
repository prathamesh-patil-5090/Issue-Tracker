# Vercel Deployment Checklist

## Pre-Deployment

- [ ] Push code to GitHub repository
- [ ] Ensure all environment variables are set in `.env.local`
- [ ] Test application locally: `pnpm dev`
- [ ] Run build locally: `pnpm build`
- [ ] Test database connection: `pnpm db:push`

## Vercel Setup

- [ ] Create Vercel account at https://vercel.com
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Build Command: `./vercel-build.sh`
  - Output Directory: `.next`
  - Install Command: `npm ci`

## Environment Variables (in Vercel Dashboard)

- [ ] `AUTH_SECRET` - Generate with: `openssl rand -base64 32`
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- [ ] `DATABASE_URL` - From Neon Database
- [ ] `NEXTAUTH_URL` - Set to: `https://your-app-name.vercel.app`

## Database Configuration

- [ ] Neon Database allows connections from `0.0.0.0/0`
- [ ] Database URL includes SSL parameters
- [ ] Run `drizzle-kit push` if schema changes are needed

## Google OAuth Configuration

- [ ] Add Vercel domain to authorized origins
- [ ] Update redirect URIs:
  - `https://your-app-name.vercel.app/api/auth/callback/google`
- [ ] Verify OAuth consent screen is configured

## Post-Deployment

- [ ] Update `NEXTAUTH_URL` in Vercel with actual domain
- [ ] Test authentication flow
- [ ] Test drag-and-drop functionality
- [ ] Test mobile responsiveness
- [ ] Verify database operations work
- [ ] Check health endpoint: `https://your-app-name.vercel.app/api/health`

## Troubleshooting

- Check Vercel deployment logs
- Verify environment variables are set correctly
- Ensure database is accessible from Vercel
- Check Google OAuth redirect URIs
- Test with health check endpoint

## Performance Optimization

- [ ] Enable Vercel Analytics (optional)
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)
- [ ] Set up preview deployments for staging

## Security

- [ ] Ensure AUTH_SECRET is strong and unique
- [ ] Verify database credentials are not exposed
- [ ] Check that sensitive files are in .gitignore
- [ ] Review CORS settings if needed
