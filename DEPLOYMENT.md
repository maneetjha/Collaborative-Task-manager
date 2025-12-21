# 🚀 Deployment Guide

This guide will walk you through deploying the Collaborative Task Manager application:

- **Backend**: Render (Node.js/Express)
- **Frontend**: Vercel (React/Vite)

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
4. **MongoDB Atlas** - Free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## 🔧 Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (choose the free M0 tier)
3. Create a database user:
   - Go to **Database Access** → **Add New Database User**
   - Choose **Password** authentication
   - Save the username and password securely
4. Whitelist IP addresses:
   - Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0) for development
5. Get your connection string:
   - Go to **Clusters** → **Connect** → **Connect your application**
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `taskmanager`)

---

## 🌐 Step 2: Deploy Backend on Render

### Option A: Using Render Dashboard (Recommended)

1. **Sign in to Render**

   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Sign in with GitHub

2. **Create a New Web Service**

   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Select the repository containing your code

3. **Configure the Service**

   - **Name**: `collaborative-task-manager-backend` (or any name you prefer)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend` (important!)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose a paid plan)

4. **Set Environment Variables**
   Click **Environment** and add:

   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URL=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-random-secret-key-here>
   FRONTEND_URL=<will-set-this-after-vercel-deployment>
   ```

   **Important Notes:**

   - `MONGO_URL`: Paste your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a random string (you can use: `openssl rand -base64 32`)
   - `FRONTEND_URL`: Leave this empty for now, we'll update it after deploying frontend

5. **Deploy**

   - Click **Create Web Service**
   - Render will start building and deploying your backend
   - Wait for deployment to complete (usually 2-5 minutes)
   - Your backend URL will be: `https://your-service-name.onrender.com`

6. **Note the Backend URL**
   - Copy the URL from Render dashboard (e.g., `https://collaborative-task-manager-backend.onrender.com`)
   - You'll need this for the frontend deployment

### Option B: Using render.yaml (Alternative)

If you prefer using the `render.yaml` file:

1. The `render.yaml` file is already in the `backend/` directory
2. In Render dashboard, go to **New +** → **Blueprint**
3. Connect your repository
4. Render will automatically detect and use the `render.yaml` file
5. Still need to set environment variables in the dashboard

---

## ⚡ Step 3: Deploy Frontend on Vercel

1. **Sign in to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**

   - Click **Add New...** → **Project**
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**

   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `frontend` (click **Edit** and set this)
   - **Build Command**: `npm run build` (should be auto-filled)
   - **Output Directory**: `dist` (should be auto-filled)
   - **Install Command**: `npm install` (should be auto-filled)

4. **Set Environment Variables**
   Click **Environment Variables** and add:

   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

   **Important:**

   - Replace `your-backend-url.onrender.com` with your actual Render backend URL
   - Make sure to include `https://` in the URL
   - No trailing slash at the end

5. **Deploy**

   - Click **Deploy**
   - Vercel will build and deploy your frontend
   - Wait for deployment to complete (usually 1-3 minutes)
   - Your frontend URL will be: `https://your-project-name.vercel.app`

6. **Note the Frontend URL**
   - Copy the URL from Vercel dashboard
   - You'll need this to update the backend CORS settings

---

## 🔄 Step 4: Update Backend CORS (Important!)

After deploying the frontend, you need to update the backend to allow requests from your Vercel URL:

1. **Go back to Render Dashboard**

   - Open your backend service
   - Go to **Environment** tab

2. **Update FRONTEND_URL**

   - Update the `FRONTEND_URL` environment variable:

   ```
   FRONTEND_URL=https://your-project-name.vercel.app
   ```

   - Replace with your actual Vercel URL
   - If you have multiple URLs (e.g., preview deployments), separate them with commas:

   ```
   FRONTEND_URL=https://your-project-name.vercel.app,https://your-project-name-git-main.vercel.app
   ```

3. **Redeploy**
   - After updating the environment variable, Render will automatically redeploy
   - Or click **Manual Deploy** → **Deploy latest commit**

---

## ✅ Step 5: Verify Deployment

1. **Test Backend**

   - Visit: `https://your-backend-url.onrender.com`
   - You should see: "Server is up and running!"

2. **Test Frontend**

   - Visit: `https://your-project-name.vercel.app`
   - Try registering a new user
   - Try creating a task
   - Check if real-time updates work (Socket.io)

3. **Check Console for Errors**
   - Open browser DevTools (F12)
   - Check Console and Network tabs for any errors
   - Verify API calls are going to the correct backend URL

---

## 🔍 Troubleshooting

### Backend Issues

**Problem**: Backend won't start

- **Solution**: Check Render logs, verify all environment variables are set correctly
- **Solution**: Ensure `MONGO_URL` is correct and MongoDB Atlas allows connections from Render's IPs

**Problem**: CORS errors

- **Solution**: Verify `FRONTEND_URL` is set correctly in Render environment variables
- **Solution**: Make sure the URL matches exactly (including `https://`)

**Problem**: MongoDB connection fails

- **Solution**: Check MongoDB Atlas Network Access allows all IPs (0.0.0.0/0)
- **Solution**: Verify the connection string has the correct password and database name

### Frontend Issues

**Problem**: Frontend shows "Cannot connect to API"

- **Solution**: Verify `VITE_API_URL` is set correctly in Vercel environment variables
- **Solution**: Check that the backend URL is accessible (visit it in browser)

**Problem**: Socket.io connection fails

- **Solution**: Verify `VITE_API_URL` points to your Render backend
- **Solution**: Check browser console for specific error messages

**Problem**: Build fails on Vercel

- **Solution**: Check Vercel build logs for specific errors
- **Solution**: Ensure `Root Directory` is set to `frontend` in Vercel project settings

---

## 🔐 Security Notes

1. **JWT_SECRET**: Use a strong, random secret key in production
2. **MongoDB**: Use strong database user passwords
3. **CORS**: After deployment, consider restricting CORS to only your Vercel domain(s)
4. **Environment Variables**: Never commit `.env` files to Git (already in `.gitignore`)

---

## 📝 Environment Variables Summary

### Backend (Render)

```
NODE_ENV=production
PORT=10000
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-random-secret-key
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)

```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🎉 You're Done!

Your application should now be live and accessible from anywhere. The frontend will communicate with the backend, and real-time updates via Socket.io should work seamlessly.
