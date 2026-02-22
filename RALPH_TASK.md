---
task: "AceVerse — Full-Stack Social Platform for Gamers"
test_command: "npm test"
---

# Task: AceVerse

Build a complete, polished social media platform purpose-built for gamers. Think X/Twitter meets gaming culture — gaming ranks, game tags on posts, trending clips, friends online, and a gamer-aesthetic dark UI with the #EF8C60 accent. Must run locally with zero external services.

## Context

### Tech Stack (already scaffolded)
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS 4 + React Query + React Router 7
- **Backend**: Express 4 + TypeScript + Zod + bcryptjs + cookie-parser + express-session
- **Database**: JSON file on disk (`db/data/aceverse.db.json`) with in-memory repos
- **Dev**: npm workspaces, concurrently, tsx, vitest

### What Already Exists
- Root `package.json` with workspaces `["backend", "frontend"]` and scripts: `dev`, `seed`, `reset`, `build`, `test`, `typecheck`, `lint`
- Backend: Express server on port 3001, CORS configured for `http://localhost:5173`, 7 route files (auth, posts, replies, users, timeline, notifications, search), 8 repos, auth middleware, Zod validation, health endpoint
- Frontend: Vite dev server on 5173, React app with routing, login/register pages, home/explore feeds with infinite scroll, post composer (280 char), post cards with edit/delete, API client (`lib/api.ts`) for auth + timeline + posts
- `.env.example` with PORT, SESSION_SECRET, FRONTEND_URL, DATA_DIR

### What Needs Work
- Frontend pages `ProfilePage`, `NotificationsPage`, `SearchPage` are stubs ("coming soon")
- Frontend `api.ts` is missing: replies, users/profile, notifications, search API calls
- No shared layout component (sidebar, right panel) — pages are standalone
- No seed script (`backend/src/db/seed.ts` referenced but missing)
- No reset script (`backend/src/db/reset.ts` referenced but missing)
- No tests (vitest configured, zero test files)
- No landing page for logged-out visitors
- No gaming-specific features (ranks, games, clips, friends online, game tags)
- No animations or transitions
- No YouTube/clip embeds
- No trending clips page

### Branding
- Primary accent: `#EF8C60` (use everywhere: buttons, active nav, links, focus rings, badges, hover states, tab underlines, notification dots)
- Dark mode is the default, light mode also supported
- Gamer aesthetic: dark backgrounds (#0D0D0D / #1A1A1A / #242424), subtle orange glows, clean typography

### Design Reference
The app layout is a 3-column desktop design:
- **Left sidebar**: User avatar + handle + follower count, navigation (Home, Trending, Profile), "Your Games" section listing games the user tracks (Valorant, Counter-Strike 2, Apex Legends, etc.)
- **Center column**: Main content area (feed, profile, thread, trending clips, landing page)
- **Right sidebar**: "Your Ranks" (per-game rank badges), "Friends Online" (online status dots), "Who to Follow" (suggested users with Follow buttons), "Trending" (hashtags like #ValorantClips, #CS2Update, #ApexRanked)

### How to Run
npm install          # install all workspaces
cp .env.example .env # if .env doesn't exist
npm run seed         # populate fake data
npm run dev          # starts backend (3001) + frontend (5173) concurrently
Success Criteria
Phase 0: Fix Foundation — Build & Run
[ ] npm install succeeds with zero errors for all workspaces
[ ] npm run dev starts both backend (port 3001) and frontend (port 5173) without crashes
[ ] GET /api/health returns { "status": "ok" } (200)
[ ] Frontend loads at http://localhost:5173 without console errors
[ ] npm run build succeeds for both backend and frontend
[ ] npm run typecheck passes with zero errors
[ ] npm run lint passes (fix or suppress non-critical warnings)
Phase 1: Seed & Reset Scripts
[ ] Create backend/src/db/seed.ts — generates at least: 10 users (with gamer-themed usernames/display names), 60+ posts (gaming content with game tags), threaded replies (nested 2-3 levels), likes/reposts/follows distributed realistically, notifications matching the actions, at least 3 games in the games table, gaming ranks for users
[ ] Create backend/src/db/reset.ts — wipes DB file then runs seed
[ ] npm run seed works and creates db/data/aceverse.db.json automatically if missing
[ ] npm run reset works (deletes DB, re-seeds)
[ ] Seeded data displays correctly in the frontend feeds after running npm run seed && npm run dev
Phase 2: Shared Layout & Navigation
[ ] Create a shared AppLayout component used by all authenticated pages with 3-column desktop layout: left sidebar (nav + your games), center content, right sidebar (ranks, friends online, who to follow, trending)
[ ] Left sidebar shows: user avatar + @username + follower count, nav links (Home, Trending, Profile) with active state using #EF8C60, "Your Games" section with game icons/names
[ ] Right sidebar shows: "Your Ranks" with per-game rank + badge icon, "Friends Online" with green online dots, "Who to Follow" with Follow buttons, "Trending" hashtags with post counts
[ ] Mobile layout: bottom tab bar (Home, Trending, Search, Notifications, Profile), floating compose FAB button, collapsible sidebars
[ ] Navigation links work and highlight the active page with #EF8C60 accent
Phase 3: Gaming Identity — Games & Ranks
[ ] Add Game model to DB types: { id, name, slug, iconUrl, color } — include at least: Valorant, Counter-Strike 2, Apex Legends, League of Legends, Rocket League, Super Smash Bros, Fortnite
[ ] Add UserGame model: { id, userId, gameId, rank, rankTier, updatedAt } — links users to games they play with their rank
[ ] Add gameTag field to Post model — optional game slug that tags a post to a specific game
[ ] Create gamesRepo and userGamesRepo with CRUD operations
[ ] Backend: GET /api/games returns all games, GET /api/users/:username/games returns user's games + ranks, PUT /api/users/:username/games updates game ranks
[ ] Profile page shows "Gaming Ranks" section with game icon, game name, rank name (e.g., "Immortal 3", "Global Elite", "Master"), rank badge, and last-updated date
[ ] Posts can be tagged with a game — post composer has optional game tag selector, PostCard shows game badge/pill
[ ] "Your Games" sidebar section shows the logged-in user's tracked games with quick links
Phase 4: Complete Auth Flow
[ ] Register page: username, email, password, display name — validates, shows errors, redirects to home on success
[ ] Login page: email + password — validates, shows errors, redirects to home on success
[ ] Logout works and redirects to landing page
[ ] Session cookie is HttpOnly, authenticated state persists on page refresh (GET /api/auth/me)
[ ] Protected pages redirect to /login if not authenticated
[ ] Auth forms have clean UI with #EF8C60 accent buttons, loading states, and error toasts
Phase 5: Landing Page (Logged-Out Experience)
[ ] Create a stunning landing page at / for logged-out users with: hero section with animated gradient/glow using #EF8C60, tagline like "Your gaming universe. One feed.", prominent Sign Up and Login CTAs
[ ] Landing page has smooth scroll animations (fade-in, slide-up on scroll) using CSS animations or Framer Motion
[ ] Feature showcase sections: "Track Your Ranks", "Share Your Clips", "Find Your Squad", "Stay in the Loop" — each with icon/illustration and description
[ ] Social proof / stats section (e.g., "Join 50K+ gamers", "1M+ clips shared" — fake numbers, looks good)
[ ] Footer with links: About, Help, Terms, Privacy
[ ] Visiting /p/:postId while logged out shows the post thread read-only (no interaction buttons), with a banner prompting login
[ ] Landing page is fully responsive and looks great on mobile
Phase 6: Home & Explore Feeds
[ ] Home feed (/) shows posts from people the user follows + own posts, sorted by newest first, with cursor pagination and infinite scroll
[ ] Explore feed (/explore) shows all posts globally, sorted by newest
[ ] Feed uses skeleton loading cards while fetching
[ ] Empty state for home feed when following nobody: "Your feed is empty. Follow some gamers to see their posts!" with suggested accounts
[ ] Post composer at top of home feed: textarea (500 char limit), optional game tag selector, character counter, Post button disabled when empty, #EF8C60 Post button
[ ] New posts appear instantly (optimistic update) at the top of the feed
Phase 7: Posts — Full CRUD
[ ] Create post works: text content (max 500 chars), optional game tag
[ ] PostCard displays: avatar, display name, @username, relative timestamp (e.g., "3h ago"), content, game tag pill, action row (reply count, like count, repost count, share)
[ ] Edit post: author-only, inline edit mode with Save/Cancel
[ ] Delete post: author-only, soft delete, shows "This post has been deleted" placeholder
[ ] Clicking a post navigates to thread view (/p/:postId)
Phase 8: Likes & Reposts
[ ] Like/unlike a post with optimistic UI — heart fills #EF8C60, count updates instantly
[ ] Repost/unrepost with optimistic UI — repost icon highlights, count updates instantly
[ ] No double likes or double reposts (repo constraint enforced)
[ ] Like creates a LIKE notification for the post author (not self)
[ ] Repost creates a REPOST notification for the post author (not self)
Phase 9: Replies & Threads
[ ] Thread page (/p/:postId) shows: root post at top, reply composer below it, replies listed chronologically
[ ] Reply to a post — reply appears optimistically
[ ] Reply to a reply (nested) — indented in thread, max visible depth of 6
[ ] Edit/delete reply: author-only, soft delete shows placeholder
[ ] Reply creates a REPLY notification for the post author (and optionally parent reply author)
[ ] Add api.replies and api.posts.reply to frontend API client
Phase 10: Follows & Profile
[ ] Full profile page (/u/:username): cover image area, avatar, display name, @username, bio, join date, follower/following counts
[ ] "Gaming Ranks" section on profile showing all games + ranks with icons and badges
[ ] User's posts tab on profile — paginated feed of their posts
[ ] Follow/unfollow button (not shown on own profile): toggles instantly, updates follower count
[ ] "Edit Profile" button on own profile (at minimum: update display name, bio, avatar URL)
[ ] Follow creates a FOLLOW notification for the followed user
[ ] Add api.users to frontend API client (getProfile, getPosts, follow, unfollow, updateProfile, getGames, updateGames)
Phase 11: Notifications
[ ] Notifications page (/notifications): lists all notifications (LIKE, REPLY, REPOST, FOLLOW) with actor avatar, action text, relative time, and link to relevant post/profile
[ ] Unread notification count badge in the nav bar (orange dot or number)
[ ] "Mark all as read" button clears unread state
[ ] Notification dropdown on bell icon click (in addition to full page) showing latest 5 notifications with "View all notifications" link
[ ] No notifications for your own actions on your own content
[ ] Add api.notifications to frontend API client (getAll, markAllRead, getUnreadCount)
Phase 12: Search
[ ] Search page (/search) with search input and debounced queries (300ms)
[ ] Search tabs: "Top" (mixed), "People" (users), "Latest" (posts by recency)
[ ] User results show avatar, display name, @username, bio snippet, Follow button
[ ] Post results show standard PostCard
[ ] Empty state: "No results for 'query'" with suggestions
[ ] Search also accessible via the search bar in the top nav / right sidebar
[ ] Add api.search to frontend API client
Phase 13: Share & Public Access
[ ] Share button on every PostCard copies the canonical link (/p/:postId) to clipboard with a toast confirmation
[ ] /p/:postId is accessible to logged-out users as read-only (shows post + replies, no action buttons)
[ ] Logged-out thread view shows a banner: "Log in to like, reply, and repost" with login link
Phase 14: Trending Page
[ ] Trending page (/trending) shows "Trending Clips" header with stats (Hot Clips count, Total Likes, last updated)
[ ] Posts ranked by engagement (likes + reposts + replies) with rank numbers (#1, #2, #3, etc.)
[ ] Game filter in left sidebar: click a game to filter trending posts by that game tag, "Clear" button to reset, selected games highlighted with #EF8C60
[ ] YouTube link detection: if a post contains a YouTube URL, render an embedded player in the PostCard
[ ] Trending section in right sidebar shows top 5 hashtags/game tags with post counts
Phase 15: Animations & Polish
[ ] Page transitions: smooth fade/slide animations when navigating between pages
[ ] Micro-interactions: like heart bounce, repost icon spin, follow button pulse
[ ] Skeleton loading cards on all feeds and profile while data loads
[ ] Toast notifications for: post created, post deleted, link copied, error messages — using #EF8C60 accent
[ ] Hover effects on all interactive elements (buttons glow, cards lift slightly)
[ ] Smooth scroll-to-top when navigating to a new page
[ ] Loading spinners on all async actions (follow, like, post creation)
Phase 16: Tests
[ ] Create backend/src/__tests__/auth.test.ts — test register, login, logout, me (at least 4 tests)
[ ] Create backend/src/__tests__/posts.test.ts — test create, get, update, delete, like, unlike (at least 6 tests)
[ ] Create backend/src/__tests__/timeline.test.ts — test home feed (following-based), explore feed (at least 3 tests)
[ ] Create backend/src/__tests__/users.test.ts — test get profile, follow, unfollow (at least 3 tests)
[ ] npm test passes all tests
Phase 17: Final Verification
[ ] npm install — clean install, no errors
[ ] npm run seed — seeds DB with realistic gaming data
[ ] npm run dev — both servers start, no crashes
[ ] npm run build — builds both workspaces successfully
[ ] npm run typecheck — zero type errors
[ ] npm run lint — passes
[ ] npm test — all tests pass
[ ] Manual QA: register user A, post 3 gaming posts with game tags, register user B, follow A, B's home feed shows A's posts, B likes/reposts A's post, A sees notifications, search works, share link works, logged-out view works, trending page shows ranked posts
API Endpoints (Complete Reference)
All inputs validated with Zod. Protected endpoints require session cookie.
Auth
POST /api/auth/register — { username, email, password, displayName? }
POST /api/auth/login — { email, password }
POST /api/auth/logout
GET /api/auth/me — returns current user or null
Timeline
GET /api/timeline/home?cursor= — posts from following + self
GET /api/timeline/explore?cursor= — all posts globally
Posts
POST /api/posts — { content, gameTag? }
GET /api/posts/:postId — post + replies tree
PATCH /api/posts/:postId — { content } (author only)
DELETE /api/posts/:postId — soft delete (author only)
POST /api/posts/:postId/like
DELETE /api/posts/:postId/like
POST /api/posts/:postId/repost
DELETE /api/posts/:postId/repost
POST /api/posts/:postId/replies — { content }
Replies
POST /api/replies/:replyId/replies — { content }
PATCH /api/replies/:replyId — { content } (author only)
DELETE /api/replies/:replyId — soft delete (author only)
Users
GET /api/users/:username — profile + counts
GET /api/users/:username/posts?cursor=
POST /api/users/:username/follow
DELETE /api/users/:username/follow
GET /api/users/:username/games — user's games + ranks
PUT /api/users/:username/games — update own game ranks
PATCH /api/users/:username — update own profile { displayName?, bio?, avatarUrl? }
Games
GET /api/games — all available games
Notifications
GET /api/notifications?cursor=
POST /api/notifications/mark-all-read
GET /api/notifications/unread-count
Search
GET /api/search?q=&type=top|people|latest
Trending
GET /api/timeline/trending?cursor=&game= — posts ranked by engagement, optional game filter
Response Shape
Every Post in API responses includes viewer-specific flags:
{  "id": "...",  "content": "...",  "gameTag": "valorant",  "author": { "username": "...", "displayName": "...", "avatarUrl": "..." },  "likeCount": 42,  "replyCount": 7,  "repostCount": 12,  "likedByMe": true,  "repostedByMe": false,  "canEdit": false,  "canDelete": false,  "createdAt": "...",  "deleted": false}
Database Schema Additions
New Models (add to db/types.ts)
export interface Game {  id: string;  name: string;  slug: string;  iconUrl: string;  color: string;}export interface UserGame {  id: string;  userId: string;  gameId: string;  rank: string;  rankTier: string;  updatedAt: string;}
Modified Models
Post: add gameTag: string | null field
Database: add games: Game[] and userGames: UserGame[]
File target
aceverse/
├── .env.example
├── package.json (root — workspaces + scripts)
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── hooks/useAuth.ts
│       ├── lib/api.ts (COMPLETE — all endpoints)
│       ├── components/
│       │   ├── AppLayout.tsx (3-column shared layout)
│       │   ├── LeftSidebar.tsx
│       │   ├── RightSidebar.tsx
│       │   ├── BottomNav.tsx (mobile)
│       │   ├── Feed.tsx
│       │   ├── PostCard.tsx
│       │   ├── PostComposer.tsx
│       │   ├── PostCardSkeleton.tsx
│       │   ├── NotificationDropdown.tsx
│       │   ├── GameTagSelector.tsx
│       │   ├── RankBadge.tsx
│       │   ├── FollowButton.tsx
│       │   ├── Toast.tsx
│       │   └── YouTubeEmbed.tsx
│       └── pages/
│           ├── LandingPage.tsx
│           ├── LoginPage.tsx
│           ├── RegisterPage.tsx
│           ├── HomePage.tsx
│           ├── ExplorePage.tsx
│           ├── TrendingPage.tsx
│           ├── SearchPage.tsx
│           ├── NotificationsPage.tsx
│           ├── ProfilePage.tsx
│           └── PostThreadPage.tsx
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── helpers.ts
│       ├── middleware/auth.ts
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── posts.ts
│       │   ├── replies.ts
│       │   ├── users.ts
│       │   ├── timeline.ts
│       │   ├── notifications.ts
│       │   ├── search.ts
│       │   └── games.ts
│       ├── db/
│       │   ├── store.ts
│       │   ├── types.ts
│       │   ├── seed.ts
│       │   ├── reset.ts
│       │   └── repos/
│       │       ├── users.ts
│       │       ├── posts.ts
│       │       ├── replies.ts
│       │       ├── likes.ts
│       │       ├── reposts.ts
│       │       ├── follows.ts
│       │       ├── notifications.ts
│       │       ├── sessions.ts
│       │       ├── games.ts
│       │       └── userGames.ts
│       └── __tests__/
│           ├── auth.test.ts
│           ├── posts.test.ts
│           ├── timeline.test.ts
│           └── users.test.ts
└── db/
    └── data/
        └── aceverse.db.json (auto-generated)
Ralph Instructions
Work through phases in order (0 → 17). Each phase builds on the previous.
Within a phase, complete all criteria before moving to the next phase.
Check off completed criteria (change [ ] to [x]).
Run npm test after Phase 16. Run npm run build && npm run typecheck && npm run lint after each phase.
Commit frequently with descriptive messages.
If a dependency is needed, install it (npm install <pkg> -w frontend or -w backend).
Use Framer Motion for animations if needed (npm install framer-motion -w frontend).
When ALL criteria are [x], output: <ralph>COMPLETE</ralph>
If stuck on the same issue 3+ times, output: <ralph>GUTTER</ralph>