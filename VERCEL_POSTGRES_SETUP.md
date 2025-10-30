# Vercel Deployment with Postgres Database

## Setup Vercel Postgres

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Link your project**:
   ```bash
   vercel link
   ```

3. **Create Vercel Postgres database**:
   ```bash
   vercel postgres create
   ```

4. **Get the connection string**:
   ```bash
   vercel postgres url
   ```
   This will give you the `DATABASE_URL` that Vercel automatically provides as `@postgres_url`.

## Database Initialization

After creating the Postgres database, run the initialization script:

```bash
python init_db_postgres.py
```

Or run it in the Vercel environment:

```bash
vercel env pull .env.local
# Then run locally with the DATABASE_URL
```

## Environment Variables in Vercel

Set these in your Vercel project settings:

- `DATABASE_URL`: Automatically provided by Vercel Postgres (`@postgres_url`)
- `SECRET_KEY`: Generate a secure random string (64 characters)
- `ALGORITHM`: `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`

## Deploy

```bash
vercel --prod
```

## Testing

After deployment, test your endpoints:
- Health: `https://your-app.vercel.app/api/health`
- Books: `https://your-app.vercel.app/api/books`
- Auth: `https://your-app.vercel.app/api/login`

## Database Schema

The database will be automatically created with tables for:
- Users
- Books
- Genres
- Ratings
- Wishlists
- And other related tables

Make sure to run the initialization script after setting up the database!