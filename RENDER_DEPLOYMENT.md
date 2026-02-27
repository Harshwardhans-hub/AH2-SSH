# Render Deployment Guide

Complete guide to deploy the Alumni Placement System on Render with PostgreSQL.

## Prerequisites

- GitHub account with your code pushed
- Render account (free tier available)

## Step 1: Create PostgreSQL Database on Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in with GitHub

2. **Create New PostgreSQL Database**
   - Click "New +" button
   - Select "PostgreSQL"
   - Configure:
     - **Name**: `alumni-db` (or your choice)
     - **Database**: `alumni_db`
     - **User**: `alumni_user` (auto-generated)
     - **Region**: Choose closest to your users
     - **PostgreSQL Version**: 15 (or latest)
     - **Plan**: Free (or paid for production)
   - Click "Create Database"

3. **Save Connection Details**
   - After creation, you'll see:
     - **Internal Database URL**: Use this for your web service
     - **External Database URL**: Use for local testing
   - Copy the "Internal Database URL"
   - Format: `postgresql://user:password@host/database`

## Step 2: Create Web Service on Render

1. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository

2. **Configure Web Service**
   - **Name**: `alumni-placement-system` (or your choice)
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `backend` if needed)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (or paid for production)

3. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   
   ```
   DATABASE_URL
   Value: [Paste Internal Database URL from Step 1]
   
   JWT_SECRET
   Value: your_super_secret_jwt_key_here
   
   SMTP_EMAIL
   Value: your_email@gmail.com
   
   SMTP_PASSWORD
   Value: your_gmail_app_password
   
   SMTP_HOST
   Value: smtp.gmail.com
   
   SMTP_PORT
   Value: 587
   
   COLLEGE_NAME
   Value: Your College Name
   
   HUGGINGFACE_API_KEY (optional)
   Value: your_huggingface_api_key
   ```

4. **Create Web Service**
   - Click "Create Web Service"
   - Render will start building and deploying

## Step 3: Verify Deployment

1. **Check Build Logs**
   - Watch the deployment logs
   - Look for:
     ```
     ✅ Connected to PostgreSQL Database
     ✅ Profile table ready
     ✅ Jobs table ready
     ... (all tables)
     🚀 Server running on http://0.0.0.0:10000
     ```

2. **Test the API**
   - Your service URL: `https://your-service-name.onrender.com`
   - Test endpoint: `https://your-service-name.onrender.com/jobs`
   - Should return JSON with jobs

3. **Check Database**
   - Go to your PostgreSQL database on Render
   - Click "Connect" → "External Connection"
   - Use psql or any PostgreSQL client:
     ```bash
     psql "postgresql://user:password@host/database"
     ```
   - Verify tables:
     ```sql
     \dt
     SELECT COUNT(*) FROM profile;
     SELECT COUNT(*) FROM jobs;
     ```

## Step 4: Deploy Frontend (Optional)

If you want to deploy frontend separately:

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect GitHub repository
   - Configure:
     - **Name**: `alumni-frontend`
     - **Branch**: `main`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`

2. **Add Environment Variable**
   ```
   REACT_APP_API_URL
   Value: https://your-backend-service.onrender.com
   ```

3. **Update Frontend API URL**
   - In `frontend/src/api.js`, update:
     ```javascript
     const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
     ```

## Step 5: Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your web service settings
   - Click "Custom Domains"
   - Add your domain
   - Update DNS records as instructed

## Troubleshooting

### Build Fails

**Error: Cannot find module**
- Ensure `package.json` is in the correct directory
- Check `Root Directory` setting

**Error: Command not found**
- Verify `Start Command` is correct: `node server.js`
- Check file path: should be `backend/server.js` or just `server.js`

### Database Connection Fails

**Error: Connection refused**
- Verify DATABASE_URL is set correctly
- Use "Internal Database URL" not "External"
- Check database is in same region as web service

**Error: SSL required**
- The code handles SSL automatically
- Ensure connection string includes SSL parameters

**Error: Too many connections**
- Reduce `max` in pool configuration
- Upgrade to paid database plan

### Application Errors

**Tables not created**
- Check logs for SQL errors
- Manually create tables:
  ```bash
  psql "YOUR_DATABASE_URL" -f backend/00-create-schema.sql
  ```

**Jobs not syncing**
- Check cron job is running (logs will show)
- Verify external API access is not blocked
- May take 30 minutes for first sync

**CORS errors**
- Ensure frontend URL is allowed in CORS
- Update `server.js` if needed:
  ```javascript
  app.use(cors({
    origin: ['https://your-frontend.onrender.com']
  }));
  ```

## Performance Optimization

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Database has connection limits

### Recommendations
1. **Upgrade to Paid Plan** for production
2. **Use Connection Pooling** (already configured)
3. **Add Health Check Endpoint**:
   ```javascript
   app.get('/health', (req, res) => {
     res.json({ status: 'ok' });
   });
   ```
4. **Monitor with Render Metrics**

## Monitoring

### View Logs
- Go to your service
- Click "Logs" tab
- Filter by severity

### Set Up Alerts
- Go to service settings
- Configure email alerts for:
  - Deploy failures
  - Service crashes
  - High memory usage

### Database Monitoring
- Go to PostgreSQL database
- View metrics:
  - Connection count
  - Query performance
  - Storage usage

## Backup Strategy

### Automatic Backups (Paid Plans)
- Render provides automatic daily backups
- Retention: 7 days (Standard), 30 days (Pro)

### Manual Backup
```bash
# Export database
pg_dump "YOUR_EXTERNAL_DATABASE_URL" > backup.sql

# Restore
psql "YOUR_EXTERNAL_DATABASE_URL" < backup.sql
```

## Scaling

### Horizontal Scaling
- Upgrade to paid plan
- Enable auto-scaling
- Configure min/max instances

### Database Scaling
- Upgrade database plan
- Increase connection pool size
- Consider read replicas (Pro plan)

## Security Checklist

- [ ] DATABASE_URL is set (not hardcoded)
- [ ] JWT_SECRET is strong and unique
- [ ] SMTP credentials are secure
- [ ] CORS is properly configured
- [ ] SQL injection prevention (using parameterized queries)
- [ ] Rate limiting enabled (if needed)
- [ ] HTTPS enforced (automatic on Render)
- [ ] Environment variables not exposed in logs

## Cost Estimation

### Free Tier
- Web Service: Free (with limitations)
- PostgreSQL: Free (1GB storage, 1GB RAM)
- Total: $0/month

### Production (Recommended)
- Web Service: $7/month (Starter)
- PostgreSQL: $7/month (Starter)
- Total: $14/month

### High Traffic
- Web Service: $25/month (Standard)
- PostgreSQL: $20/month (Standard)
- Total: $45/month

## Support

- Render Documentation: https://render.com/docs
- Community Forum: https://community.render.com
- Status Page: https://status.render.com

## Next Steps

1. ✅ Database created
2. ✅ Web service deployed
3. ✅ Environment variables configured
4. ✅ Application running
5. 🔄 Monitor logs and performance
6. 🔄 Set up custom domain (optional)
7. 🔄 Configure backups
8. 🔄 Add monitoring alerts

---

**Deployment Complete!** 🎉

Your application is now live at: `https://your-service-name.onrender.com`
