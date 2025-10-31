# Deploying Birmingham Kids to Vercel

This guide will walk you through deploying Birmingham Kids to Vercel via GitHub.

## Prerequisites

1. **GitHub Account**: Create one at [github.com](https://github.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) using your GitHub account
3. **Database**: You'll need a PostgreSQL database (see Database Setup below)

## Step 1: Push Code to GitHub

### 1.1 Initialize Git Repository (if not already done)

From the Replit Shell, run:

```bash
git init
git add .
git commit -m "Initial commit - Birmingham Kids app"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name your repository (e.g., `birmingham-kids`)
3. Choose Public or Private
4. **Do NOT** initialize with README (we already have code)
5. Click "Create repository"

### 1.3 Push to GitHub

Copy the commands from GitHub's "push an existing repository" section, something like:

```bash
git remote add origin https://github.com/YOUR_USERNAME/birmingham-kids.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Database

You have several options for PostgreSQL hosting:

### Option A: Vercel Postgres (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on "Storage"
3. Click "Create Database"
4. Select "Postgres"
5. Choose your region (closest to Birmingham, AL)
6. Name it `birmingham-kids-db`
7. Click "Create"
8. Copy the `DATABASE_URL` connection string

### Option B: Neon (Free Tier Available)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)

### Option C: Supabase (Free Tier Available)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)

## Step 3: Set Up Database Schema

You'll need to create the database tables. Run these SQL commands in your database:

### Using Vercel Postgres:
1. In Vercel Dashboard → Storage → Your Database
2. Click "Query" tab
3. Paste and run the SQL schema (see below)

### SQL Schema:

```sql
-- Sessions table (for user sessions)
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX "IDX_session_expire" ON sessions(expire);

-- Users table
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  directory VARCHAR NOT NULL,
  listing_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX favorites_user_id_idx ON favorites(user_id);
CREATE INDEX favorites_directory_idx ON favorites(directory);
```

## Step 4: Deploy to Vercel

### 4.1 Import Your Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `birmingham-kids` repository
4. Click "Import"

### 4.2 Configure Project

**Framework Preset**: Other

**Root Directory**: Leave as `.` (root)

**Build Command**: Leave empty or use `npm install`

**Output Directory**: Leave empty

### 4.3 Add Environment Variables

Click "Environment Variables" and add:

**Required:**
- `DATABASE_URL`: Your PostgreSQL connection string from Step 2
- `SESSION_SECRET`: A random string (e.g., generate with: `openssl rand -base64 32`)

**Optional (for production):**
- `NODE_ENV`: `production`

### 4.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (1-2 minutes)
3. You'll get a URL like `https://birmingham-kids.vercel.app`

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Navigate through the directories (Childcare, Pediatricians, etc.)
3. Test the map view
4. Test search and filters

**Note:** Authentication will not work yet since we removed Replit Auth. See the Authentication Setup section below.

## Step 6: Set Up Authentication (Optional)

The app currently has authentication disabled. To add it back, you have several options:

### Option A: Clerk (Recommended - Easiest)

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Get your API keys
4. Install: `npm install @clerk/clerk-sdk-node`
5. Update `api/index.js` to use Clerk middleware

### Option B: Auth0

1. Sign up at [auth0.com](https://auth0.com)
2. Create a new application (Regular Web Application)
3. Configure callback URLs
4. Install and configure Auth0 Express SDK

### Option C: NextAuth.js

1. Install: `npm install next-auth`
2. Configure providers (Google, GitHub, etc.)
3. Set up authentication routes

## Step 7: Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update your DNS records as instructed
5. Wait for SSL certificate provisioning

## Automatic Deployments

Now that you're connected:

- **Every push to `main` branch** = automatic production deployment
- **Every push to other branches** = preview deployment
- **Every pull request** = preview deployment

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically rebuild and deploy!

## Troubleshooting

### "404 Not Found" on page refresh

This shouldn't happen with the current `vercel.json` configuration, but if it does:
- Check that `vercel.json` routes are correct
- Verify `api/index.js` is exporting the Express app

### Database connection errors

- Verify `DATABASE_URL` is set in Vercel environment variables
- Check that your database allows connections from Vercel's IP ranges
- For Vercel Postgres, it should work automatically

### Static files not loading

- Ensure `assets/` and `data/` folders are in your Git repository
- Check that routes in `vercel.json` include static file patterns
- Verify files aren't in `.gitignore`

### Environment variables not working

- Environment variables need to be set in Vercel Dashboard
- After adding new variables, redeploy your project
- Check spelling and case sensitivity

## Performance Tips

1. **Enable Caching**: Vercel automatically caches static assets
2. **Optimize Images**: Consider using Vercel's image optimization
3. **Monitor Usage**: Check Vercel Dashboard for bandwidth and function invocations
4. **Free Tier Limits**: Be aware of Vercel's free tier limits (bandwidth, function executions)

## Cost Considerations

**Vercel Free Tier Includes:**
- 100 GB bandwidth per month
- 100 GB-Hrs serverless function execution
- Unlimited deployments
- Automatic SSL

**Database Costs:**
- Vercel Postgres: Check current pricing
- Neon: Free tier available (3 GB storage)
- Supabase: Free tier available (500 MB database, 2 GB bandwidth)

## Support

For issues specific to:
- **Vercel Platform**: [vercel.com/support](https://vercel.com/support)
- **Birmingham Kids App**: Create an issue in your GitHub repository

## Next Steps

1. Set up authentication
2. Configure custom domain
3. Monitor performance in Vercel Analytics
4. Set up continuous integration tests
5. Add a staging environment (deploy from a `develop` branch)

Congratulations! Your Birmingham Kids app is now live on Vercel! 🎉
