# StudyBuddy Deployment Guide

## 🚀 Free Deployment Options for Recruiters

### Option 1: Vercel (Frontend) + Railway (Backend) - **Recommended**

#### Frontend Deployment (Vercel - Free Tier)
1. **Sign up** at [vercel.com](https://vercel.com) with your GitHub account
2. **Connect your repository** to Vercel
3. **Configure build settings**:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Add environment variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
5. **Deploy** - Vercel will automatically deploy on every push to main branch

#### Backend Deployment (Railway - Free Tier)
1. **Sign up** at [railway.app](https://railway.app) with your GitHub account
2. **Create new project** from GitHub repository
3. **Configure settings**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add environment variables** in Railway dashboard:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
5. **Deploy** - Railway will provide a public URL

### Option 2: Netlify (Frontend) + Render (Backend)

#### Frontend Deployment (Netlify - Free Tier)
1. **Sign up** at [netlify.com](https://netlify.com)
2. **Connect your repository**
3. **Configure build settings**:
   - Build Command: `cd frontend && npm run build`
   - Publish Directory: `frontend/.next`
4. **Add environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```

#### Backend Deployment (Render - Free Tier)
1. **Sign up** at [render.com](https://render.com)
2. **Create new Web Service**
3. **Connect your repository**
4. **Configure settings**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add environment variables**

### Option 3: GitHub Pages + Cyclic (Alternative)

#### Frontend Deployment (GitHub Pages)
1. **Enable GitHub Pages** in your repository settings
2. **Configure for Next.js** with custom domain
3. **Add environment variables** in GitHub repository secrets

#### Backend Deployment (Cyclic - Free Tier)
1. **Sign up** at [cyclic.sh](https://cyclic.sh)
2. **Connect your repository**
3. **Configure for Node.js backend**

## 🔧 Environment Variables Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studybuddy
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=production
```

## 📝 Pre-Deployment Checklist

### Frontend
- [ ] ✅ API configuration is already set up in `frontend/lib/api.js` to use environment variables
- [ ] Test all features locally
- [ ] Ensure all dependencies are in `package.json`
- [ ] Check that `.gitignore` excludes `.env` files

### Backend
- [ ] Set up MongoDB Atlas (free tier available)
- [ ] Configure CORS for your frontend domain
- [ ] Test all API endpoints
- [ ] Ensure proper error handling
- [ ] Set up proper logging

## 🎯 For Recruiters

### Quick Demo Setup
1. **Clone the repository**
2. **Follow the deployment guide above**
3. **Share the live URL** with your application

### Demo Credentials (Optional)
Create a demo account for recruiters:
- Email: `demo@studybuddy.com`
- Password: `demo123`

## 🔒 Security Notes

- ✅ API keys are protected by `.gitignore`
- ✅ Environment variables are properly configured
- ✅ CORS is set up for production domains
- ✅ JWT tokens are properly secured

## 📊 Performance Optimization

### Frontend
- Next.js automatic optimization
- Image optimization enabled
- Code splitting implemented

### Backend
- Proper error handling
- Efficient database queries
- File upload size limits

## 🆘 Troubleshooting

### Common Issues
1. **CORS errors**: Ensure backend CORS includes your frontend domain
2. **Environment variables**: Double-check all variables are set in hosting platform
3. **Build failures**: Check Node.js version compatibility
4. **Database connection**: Verify MongoDB connection string

### Support
- Check the README.md for detailed setup instructions
- Review the API documentation in the codebase
- Test locally before deploying

## 🎉 Success!

Once deployed, your StudyBuddy application will be accessible to recruiters worldwide, showcasing your full-stack development skills with a modern, feature-rich study tool! 