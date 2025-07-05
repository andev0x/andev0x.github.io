# 🚀 Deployment Guide - Fix Production Backend

## 🔍 **Current Issue**

Your production backend at `https://go-blog-production-e388.up.railway.app/` is missing the latest API endpoints. The GET endpoints work, but POST endpoints return 404.

## ✅ **What's Fixed in Frontend**

The frontend has been updated to use the production backend URL:
- ✅ API base URL: `https://go-blog-production-e388.up.railway.app/api/v1`
- ✅ Health check endpoint working
- ✅ GET endpoints working
- ❌ POST endpoints returning 404 (need backend redeploy)

## 🔧 **Backend Redeployment Steps**

### **Option 1: Railway CLI (Recommended)**

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Navigate to backend directory**:
   ```bash
   cd go-blog
   ```

4. **Deploy to Railway**:
   ```bash
   railway up
   ```

### **Option 2: GitHub Integration**

If your Railway project is connected to GitHub:

1. **Commit and push your changes**:
   ```bash
   cd go-blog
   git add .
   git commit -m "Fix API endpoints for production"
   git push origin main
   ```

2. **Railway will automatically redeploy** when it detects the push.

### **Option 3: Manual Upload**

1. **Build the application**:
   ```bash
   cd go-blog
   go build -o server ./cmd/server
   ```

2. **Upload to Railway** via their web interface.

## 🔍 **Verify Deployment**

After redeployment, test these endpoints:

```bash
# Health check
curl https://go-blog-production-e388.up.railway.app/test

# Get comments (should work)
curl https://go-blog-production-e388.up.railway.app/api/v1/posts/test-slug/comments

# Post comment (should work after redeploy)
curl -X POST -H "Content-Type: application/json" \
  -d '{"author":"test","content":"test comment"}' \
  https://go-blog-production-e388.up.railway.app/api/v1/posts/test-slug/comments

# Post rating (should work after redeploy)
curl -X POST -H "Content-Type: application/json" \
  -d '{"value":5}' \
  https://go-blog-production-e388.up.railway.app/api/v1/posts/test-slug/ratings
```

## 🎯 **Expected Results After Redeploy**

- ✅ All GET endpoints return proper JSON
- ✅ All POST endpoints return 201 Created with data
- ✅ Comments persist in database
- ✅ Ratings persist in database
- ✅ Frontend can save and retrieve data

## 🚨 **Important Notes**

1. **Database**: Your production database will be preserved during redeployment
2. **Environment Variables**: Make sure `DATABASE_URL` is set in Railway
3. **CORS**: The backend is configured to allow requests from `andev0x.github.io`

## 🔄 **Frontend Deployment**

The frontend is already configured correctly. After backend redeployment:

1. **Build frontend**:
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages** (if using GitHub Actions or manual deployment)

## 📞 **Troubleshooting**

If redeployment doesn't work:

1. **Check Railway logs** for deployment errors
2. **Verify environment variables** are set correctly
3. **Test locally** first: `go run cmd/server/main.go`
4. **Check database connection** in production

## 🎉 **After Successful Redeployment**

Your blog will have:
- ✅ Persistent comments and ratings
- ✅ Data survives page refreshes
- ✅ Full production functionality
- ✅ Proper error handling and fallbacks 