# Swagger API Documentation - Vercel Fix Summary

## Problem

The `/api-docs` endpoint was not visible/accessible on Vercel's serverless deployment.

## Root Causes Identified

1. **Glob patterns** in swagger-jsdoc don't work reliably in serverless environments
2. **Helmet CSP** was blocking Swagger UI inline scripts and styles
3. **MQTT connections** can timeout or block in serverless environments
4. **Swagger UI middleware** needed better configuration for serverless

## Changes Made

### 1. `components/swaggerSpec.js`

-  ✅ Replaced glob pattern `"./**/*Routes.js"` with explicit file paths
-  ✅ Added `path.join()` for reliable file resolution
-  ✅ Added `servers` configuration for better API documentation

### 2. `components/middleware.js`

-  ✅ Disabled Helmet's Content Security Policy to allow Swagger UI resources
-  ✅ Added `/api-docs.json` endpoint to serve the raw OpenAPI spec
-  ✅ Updated Swagger UI to reference the JSON endpoint (`url: '/api-docs.json'`)
-  ✅ **Disabled MQTT in Vercel environment** to prevent connection blocking
-  ✅ Added environment check: `process.env.VERCEL !== '1'`

### 3. `components/deviceRoutes.js`

-  ✅ Added null check for mqttClient before publishing
-  ✅ Added warning message when MQTT is unavailable

### 4. `api/index.js`

-  ✅ Added `/health` endpoint for monitoring
-  ✅ Fixed serverless export to use `serverless-http` wrapper
-  ✅ Added Vercel environment detection
-  ✅ Proper conditional server startup (local only)

### 5. `vercel.json`

-  ✅ Added `maxDuration: 30` for the API function
-  ✅ Kept simple rewrite rule for routing

## Testing Results

### Local Testing ✅

```
http://localhost:3000/health         -> 200 OK
http://localhost:3000/api-docs.json  -> 200 OK (OpenAPI spec)
http://localhost:3000/api-docs       -> 200 OK (Swagger UI)
```

## Deployment Instructions

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Fix Swagger UI for Vercel serverless deployment"
git push origin feature/dev-v001
```

### 2. Deploy to Vercel

```bash
vercel --prod
```

Or push to your connected Git branch and Vercel will auto-deploy.

### 3. Test on Vercel

After deployment, test these endpoints:

-  `https://your-app.vercel.app/health`
-  `https://your-app.vercel.app/api-docs.json`
-  `https://your-app.vercel.app/api-docs`

## Important Notes

### MQTT in Serverless

⚠️ **MQTT is now disabled on Vercel** because:

-  Serverless functions are stateless and ephemeral
-  MQTT requires persistent connections
-  Connection establishment can timeout or block requests

**Alternative Solutions for Production:**

1. Use Vercel Edge Functions with WebSockets
2. Use a separate always-on MQTT service
3. Use HTTP-based pub/sub (like Pusher, Ably, or Firebase)
4. Deploy MQTT handler to a traditional server (not serverless)

### SSE (Server-Sent Events)

⚠️ **SSE routes (`/events`)** also won't work properly in Vercel's serverless environment as they require long-lived connections.

## Troubleshooting

### If Swagger still doesn't work on Vercel:

1. **Check Vercel Logs:**

   ```bash
   vercel logs
   ```

2. **Verify Environment:**

   -  Ensure `VERCEL=1` is set (automatic in Vercel)
   -  Check function timeout limits

3. **Test JSON endpoint first:**

   ```
   https://your-app.vercel.app/api-docs.json
   ```

   If this works but UI doesn't, it's a static asset serving issue.

4. **Check browser console:**
   -  Look for CSP errors
   -  Check for 404s on Swagger UI assets

### Manual Verification

You can verify the Swagger spec is correct by:

```bash
curl https://your-app.vercel.app/api-docs.json | jq .
```

## What's Working Now

✅ Swagger UI route configuration compatible with serverless
✅ OpenAPI spec generation with explicit file paths
✅ Helmet configured to allow Swagger UI resources
✅ MQTT properly handled (disabled in Vercel, enabled locally)
✅ Health check endpoint for monitoring
✅ All routes properly documented in Swagger

## Next Steps

1. Deploy to Vercel and test `/api-docs`
2. Consider migrating real-time features (MQTT/SSE) to WebSockets or HTTP polling
3. Set up proper environment variables in Vercel dashboard if needed
4. Monitor function execution time and optimize if needed

---

**Last Updated:** 2025-10-28
**Status:** Ready for Deployment
