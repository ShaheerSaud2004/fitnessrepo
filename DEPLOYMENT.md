# 🚀 Fitness Tracker - Deployment Guide

This guide will help you deploy your fitness tracking application to various platforms.

## 📋 Prerequisites

1. **Git Repository**: Make sure your code is in a Git repository (GitHub, GitLab, etc.)
2. **Node.js**: Ensure you have Node.js installed locally
3. **Account**: Create accounts on your chosen deployment platform

## 🎯 Deployment Options

### Option 1: Vercel (Recommended - Free & Easy)

**Best for**: Full-stack Node.js applications with automatic deployments

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
# Deploy to production
npm run deploy:vercel

# Or manually
vercel --prod
```

#### Step 4: Set Environment Variables
In your Vercel dashboard:
1. Go to your project settings
2. Add environment variables:
   - `JWT_SECRET`: Your secret key for JWT tokens
   - `NODE_ENV`: `production`

#### Step 5: Configure Database
For production, consider using:
- **Vercel Postgres** (built-in)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)

### Option 2: Railway (Free tier available)

**Best for**: Full-stack applications with databases

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Login to Railway
```bash
railway login
```

#### Step 3: Initialize Project
```bash
railway init
```

#### Step 4: Deploy
```bash
npm run deploy:railway

# Or manually
railway up
```

#### Step 5: Set Environment Variables
```bash
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production
```

### Option 3: Netlify (Free & Easy)

**Best for**: Static sites with serverless functions

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify
```bash
netlify login
```

#### Step 3: Deploy
```bash
npm run deploy:netlify

# Or manually
netlify deploy --prod
```

### Option 4: Heroku (Paid but reliable)

#### Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Login to Heroku
```bash
heroku login
```

#### Step 3: Create App
```bash
heroku create your-fitness-app-name
```

#### Step 4: Set Environment Variables
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
```

#### Step 5: Deploy
```bash
git push heroku main
```

### Option 5: DigitalOcean App Platform

#### Step 1: Create App
1. Go to DigitalOcean App Platform
2. Connect your Git repository
3. Configure build settings

#### Step 2: Set Environment Variables
- `JWT_SECRET`: Your secret key
- `NODE_ENV`: `production`

#### Step 3: Deploy
Click "Deploy" in the DigitalOcean dashboard

## 🔧 Environment Variables

Set these environment variables in your deployment platform:

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000  # Usually auto-set by platform
```

## 🗄️ Database Configuration

### For Production, consider these database options:

1. **Vercel Postgres** (if using Vercel)
2. **PlanetScale** (MySQL)
3. **Supabase** (PostgreSQL)
4. **Railway Postgres** (if using Railway)
5. **Heroku Postgres** (if using Heroku)

### Update Database Configuration

If using a different database, update `server/models/index.js`:

```javascript
// For PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// For MySQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql'
});
```

## 🔒 Security Considerations

1. **JWT Secret**: Use a strong, random secret key
2. **HTTPS**: All platforms provide HTTPS by default
3. **CORS**: Update CORS settings for your domain
4. **Rate Limiting**: Consider adding rate limiting middleware
5. **Input Validation**: Ensure all inputs are properly validated

## 📊 Monitoring & Analytics

Consider adding:
- **Sentry** for error tracking
- **Google Analytics** for user analytics
- **Uptime monitoring** (UptimeRobot, Pingdom)

## 🚀 Quick Deploy Commands

```bash
# Vercel (Recommended)
npm run deploy:vercel

# Railway
npm run deploy:railway

# Netlify
npm run deploy:netlify

# Heroku
git push heroku main
```

## 🎉 Post-Deployment

1. **Test your application** thoroughly
2. **Set up monitoring** and error tracking
3. **Configure custom domain** (optional)
4. **Set up CI/CD** for automatic deployments
5. **Monitor performance** and user feedback

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection**: Ensure database URL is correct
2. **Environment Variables**: Check all required variables are set
3. **Build Errors**: Check Node.js version compatibility
4. **CORS Issues**: Update CORS settings for your domain
5. **JWT Errors**: Ensure JWT_SECRET is properly set

### Getting Help:

- Check platform-specific documentation
- Review error logs in deployment dashboard
- Test locally with production environment variables

## 📈 Scaling Considerations

As your app grows:
1. **Database**: Consider managed database services
2. **CDN**: Use CDN for static assets
3. **Caching**: Implement Redis for session storage
4. **Load Balancing**: Consider multiple instances
5. **Monitoring**: Add comprehensive monitoring

---

**Happy Deploying! 🚀**

Your fitness application is now ready for production use!
