# ContentFlow — TikTok & Facebook Content Scheduler

A full-stack web app for scheduling and managing your TikTok and Facebook content in one place.

## Features

- **Schedule Posts** — Set specific dates & times for auto-publishing
- **Dashboard** — Stats, upcoming posts, weekly activity chart  
- **Calendar View** — Visual monthly calendar of all scheduled content
- **Media Support** — Upload images & videos (up to 100MB), or use URLs
- **Multi-Platform** — Post to Facebook, TikTok, or both simultaneously
- **Post Management** — Draft, edit, duplicate, and delete posts
- **Real-time Scheduler** — Backend cron job checks every minute for due posts
- **Authentication** — Secure JWT-based user accounts

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | TanStack Query (React Query) |
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| Scheduler | node-cron |
| Auth | JWT + bcrypt |

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/elesiaann/content-scheduler.git
cd content-scheduler
npm run install:all
```

### 2. Configure Backend
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your settings:
```env
JWT_SECRET=your_strong_random_secret_here
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

### 3. Start Development
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Connecting Social Platforms

### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create an app → Add **Pages API** product
3. Generate a **Page Access Token** with these permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`  
   - `pages_show_list`
4. In the app Settings → paste token + Page ID

### TikTok
1. Go to [TikTok Developer Portal](https://developers.tiktok.com)
2. Create an app with **Content Posting API** access
3. Enable scopes: `video.publish`, `video.upload`
4. Complete OAuth to get your access token
5. In the app Settings → paste your token

## Project Structure
```
content-scheduler/
├── frontend/          # React + TypeScript app
│   └── src/
│       ├── pages/     # Dashboard, Posts, Calendar, Schedule, Settings
│       ├── components/# PostCard, PostForm, Layout
│       ├── contexts/  # Auth context
│       └── utils/     # API client, helpers
├── backend/           # Express API
│   └── src/
│       ├── routes/    # auth, posts, platforms
│       ├── services/  # scheduler, facebook, tiktok, publisher
│       └── db/        # SQLite setup
└── package.json       # Root scripts
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register account |
| POST | `/api/auth/login` | Login |
| GET | `/api/posts` | List posts |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/publish` | Publish now |
| GET | `/api/posts/stats` | Dashboard stats |
| GET | `/api/posts/calendar` | Calendar data |
| GET | `/api/platforms` | Get connections |
| POST | `/api/platforms/facebook/connect` | Connect Facebook |
| POST | `/api/platforms/tiktok/connect` | Connect TikTok |

## License
MIT
