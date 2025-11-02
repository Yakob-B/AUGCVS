# 🚀 Deployment Guide - AUGCVS

## Pre-Deployment Checklist

### ✅ Completed
- [x] Frontend build configuration (Vite)
- [x] Backend production scripts
- [x] Environment variable setup
- [x] CORS configuration
- [x] MongoDB connection handling
- [x] Error handling middleware
- [x] File upload system
- [x] Authentication & authorization
- [x] API pagination
- [x] Database indexes

### ⚠️ Before Deploying - Required Actions

1. **Environment Variables Setup**
   - [ ] Set production MongoDB URI (MongoDB Atlas recommended)
   - [ ] Generate strong JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - [ ] Configure email service (SMTP credentials)
   - [ ] Set CLIENT_URL to your production frontend URL
   - [ ] Set NODE_ENV=production

2. **MongoDB Setup**
   - [ ] Create MongoDB Atlas cluster (free tier available)
   - [ ] Whitelist deployment platform IP (0.0.0.0/0 for Render, or specific IPs)
   - [ ] Get connection string and add to MONGODB_URI
   - [ ] Test connection locally with production URI

3. **File Storage**
   - [ ] Ensure uploads directory exists on server (or use cloud storage like AWS S3 for production)
   - [ ] Consider migrating uploads to cloud storage for scalability

4. **Security Hardening**
   - [ ] Change all default passwords
   - [ ] Use strong JWT secret (min 32 characters)
   - [ ] Enable HTTPS/SSL certificates
   - [ ] Review CORS origins (use specific URLs, not *)

5. **Testing**
   - [ ] Test API endpoints in production-like environment
   - [ ] Test file uploads
   - [ ] Test authentication flow
   - [ ] Test email notifications

## Deployment Platforms

### Frontend: Vercel (Recommended)

**Advantages:**
- Free tier available
- Automatic HTTPS
- CDN distribution
- Easy environment variable management
- Automatic deployments from Git

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Navigate to client: `cd client`
4. Deploy: `vercel`
5. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

**Vercel Dashboard:**
- Go to vercel.com
- Import your Git repository
- Set Root Directory to `client`
- Add environment variable: `VITE_API_URL`

### Backend: Render (Recommended)

**Advantages:**
- Free tier available (with limitations)
- Easy MongoDB Atlas integration
- Automatic SSL
- Environment variable management
- Git-based deployments

**Steps:**
1. Create account at render.com
2. Create new Web Service
3. Connect your Git repository
4. Configure:
   - **Name:** augcvs-server
   - **Environment:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Root Directory:** (leave empty, or set to project root)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/augcvs?retryWrites=true&w=majority
   JWT_SECRET=your_strong_secret_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   CLIENT_URL=https://your-frontend.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_NAME=Ambo University
   FROM_EMAIL=your_email@gmail.com
   ```

### Alternative: Backend on Heroku

**Steps:**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create augcvs-server`
4. Add buildpack: `heroku buildpacks:set heroku/nodejs`
5. Set config vars in Heroku dashboard
6. Deploy: `git push heroku main`

## Production Configuration

### Backend Production Optimizations

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Rate Limiting** (Recommended)
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use('/api/', limiter);
   ```

3. **Helmet for Security Headers**
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

### Frontend Production Build

```bash
cd client
npm run build
```

Output will be in `client/dist/` folder.

### Environment Variables Summary

**Backend (server/.env):**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_very_strong_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CLIENT_URL=https://your-frontend.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_NAME=Ambo University
FROM_EMAIL=your_email@gmail.com
```

**Frontend (client/.env.production):**
```
VITE_API_URL=https://your-backend.render.com/api
```

## Post-Deployment Checklist

- [ ] Test frontend can connect to backend
- [ ] Test user registration
- [ ] Test user login
- [ ] Test file uploads
- [ ] Test email notifications (if configured)
- [ ] Verify HTTPS is working
- [ ] Test all role-based routes
- [ ] Monitor error logs
- [ ] Set up monitoring (optional: Sentry, LogRocket)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CLIENT_URL matches your frontend URL exactly
   - Check for trailing slashes
   - Verify protocol (http vs https)

2. **MongoDB Connection Issues**
   - Check IP whitelist in MongoDB Atlas
   - Verify connection string format
   - Ensure database user has correct permissions

3. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Consider using cloud storage (AWS S3, Cloudinary)

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check for TypeScript errors if applicable

## Monitoring & Maintenance

1. **Logs**: Monitor application logs on your hosting platform
2. **Database**: Regular backups (MongoDB Atlas provides automatic backups)
3. **Updates**: Keep dependencies updated for security patches
4. **Performance**: Monitor API response times
5. **Storage**: Monitor uploads directory size

## Support

For issues or questions, refer to the main README.md or create an issue in the repository.

---
**Last Updated:** $(date)
**Version:** 1.0.0
