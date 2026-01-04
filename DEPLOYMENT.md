# 🚀 TruthLens AI Deployment Guide

## Quick Deploy (Free Tier)

### Backend → Render.com

1. **Go to** [render.com](https://render.com) and sign up/login
2. **New** → **Web Service** → **Connect GitHub Repo**
3. Select `ByteQuest-2025/GFGBQ-Team-team-nork`
4. **Settings:**
   - Name: `truthlens-api`
   - Runtime: `Docker`
   - Branch: `main`
5. **Environment Variables** (Add in Render Dashboard):
   ```
   MONGO_URI=mongodb+srv://your-mongodb-atlas-uri
   REDIS_URL=redis://your-redis-cloud-uri
   GOOGLE_AI_API_KEY=your-gemini-api-key
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
6. **Deploy!** → Note your URL: `https://truthlens-api.onrender.com`

---

### Frontend → Vercel

1. **Go to** [vercel.com](https://vercel.com) and sign up/login
2. **New Project** → **Import Git Repository**
3. Select `ByteQuest-2025/GFGBQ-Team-team-nork`
4. **Configure:**
   - Framework Preset: `Vite`
   - Root Directory: `truthlens-ui`
5. **Environment Variables:**
   ```
   VITE_API_URL=https://truthlens-api.onrender.com
   ```
6. **Deploy!**

---

## Environment Variables Summary

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `REDIS_URL` | Redis Cloud connection string |
| `GOOGLE_AI_API_KEY` | Google AI Studio API key |
| `FRONTEND_URL` | Your Vercel frontend URL |
| `JWT_SECRET` | Auto-generated on Render |
| `JWT_REFRESH_SECRET` | Auto-generated on Render |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your Render backend URL |

---

## Post-Deployment Checklist

- [ ] Backend `/health` returns `{ status: "ok" }`
- [ ] Frontend loads cinematic rocket animation
- [ ] Login/Register works
- [ ] Text Verification returns results
- [ ] URL Scanning returns results

---

## Troubleshooting

**CORS Error?** → Update `FRONTEND_URL` in Render to match your Vercel domain

**502 Bad Gateway?** → Check Render logs, ensure MongoDB/Redis are connected

**AI at Capacity?** → Heuristic Engine will automatically take over
