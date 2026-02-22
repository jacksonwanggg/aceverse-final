---
task: "AceVerse — Full-Stack Social Platform for Gamers"
test_command: "npm run typecheck && npm run build && npm test"
---

# Task: AceVerse

Build a complete, polished social media platform purpose-built for gamers. Think X/Twitter meets gaming culture — gaming ranks, game tags on posts, trending clips, friends online, and a gamer-aesthetic dark UI with the `#EF8C60` accent. Must run locally with zero external services.

## CRITICAL RULES FOR RALPH

> **READ THIS FIRST. These rules override everything else.**
>
> 1. There are **107 checkboxes** below across **18 phases** (Phase 0–17). You are **NOT DONE** until **EVERY SINGLE ONE** is `[x]`. Count them.
> 2. **DO NOT** output `<ralph>COMPLETE</ralph>` unless you have **verified** that zero `[ ]` remain in this file. Grep for `"[ ]"` before signaling.
> 3. After **every phase**, run: `npm run typecheck && npm run build && npm run lint`. If any fail, fix before moving on.
> 4. After **Phase 16**, also run: `npm test`. All tests must pass.
> 5. After **Phase 17**, run the **full verification suite**: `npm install && npm run seed && npm run build && npm run typecheck && npm run lint && npm test`. ALL must exit 0.
> 6. Work phases **in order** (0 → 17). Complete ALL criteria in a phase before starting the next.
> 7. Install any missing dependencies with `npm install <pkg> -w frontend` or `-w backend`. Never leave broken imports.
> 8. Commit after each completed phase with a descriptive message.
> 9. If stuck on the same issue 3+ times, output: `<ralph>GUTTER</ralph>`

## Context

### Tech Stack
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS 4 + React Query + React Router 7
- **Backend**: Express 4 + TypeScript + Zod + bcryptjs + cookie-parser + express-session
- **Database**: JSON file on disk (`db/data/aceverse.db.json`) with in-memory repos
- **Dev**: npm workspaces, concurrently, tsx, vitest

### What Already Exists
- Root `package.json` with workspaces `["backend", "frontend"]` and scripts: `dev`, `seed`, `reset`, `build`, `test`, `typecheck`, `lint`
- Backend: Express server on port 3001, CORS for `http://localhost:5173`, 7 route files (auth, posts, replies, users, timeline, notifications, search), 8 repos, auth middleware, Zod validation, health endpoint
- Frontend: Vite dev server on 5173, React app with routing, login/register pages, home/explore feeds with infinite scroll, post composer (280 char), post cards with edit/delete, API client (`lib/api.ts`) for auth + timeline + posts
- `.env.example` with PORT, SESSION_SECRET, FRONTEND_URL, DATA_DIR
- Seed and reset scripts exist and work (`backend/src/db/seed.ts`, `backend/src/db/reset.ts`)
- Game and UserGame types added to DB, gamesRepo and userGamesRepo created, gameTag on Post model

### What Needs Work
- Frontend pages `ProfilePage`, `NotificationsPage`, `SearchPage` are stubs ("coming soon" placeholders)
- Frontend `api.ts` is missing: replies, users/profile, notifications, search, games API calls
- No shared layout component (sidebar, right panel) — pages are standalone divs
- No landing page for logged-out visitors
- No 3-column layout with sidebars
- No animations or transitions
- No YouTube/clip embeds
- No trending clips page
- No tests (vitest configured, zero test files)
- Many frontend features not wired to existing backend endpoints

### Branding
- Primary accent: `#EF8C60` (buttons, active nav, links, focus rings, badges, hover states, tab underlines, notification dots)
- Dark mode is the default, light mode also supported
- Gamer aesthetic: dark backgrounds (`#0D0D0D` / `#1A1A1A` / `#242424`), subtle orange glows, clean typography

### Design Reference (3-Column Desktop Layout)
- **Left sidebar**: User avatar + handle + follower count, navigation (Home, Trending, Profile), "Your Games" section listing tracked games (Valorant, Counter-Strike 2, Apex Legends, etc.)
- **Center column**: Main content area (feed, profile, thread, trending clips, landing page)
- **Right sidebar**: "Your Ranks" (per-game rank badges), "Friends Online" (online status dots), "Who to Follow" (suggested users with Follow buttons), "Trending" (hashtags like #ValorantClips, #CS2Update, #ApexRanked)

### How to Run

```bash
npm install          # install all workspaces
cp .env.example .env # if .env doesn't exist
npm run seed         # populate fake data
npm run dev          # starts backend (3001) + frontend (5173) concurrently
```

---

## Success Criteria

### Phase 0: Fix Foundation — Build & Run

- [x] `npm install` succeeds with zero errors for all workspaces
- [x] `npm run dev` starts both backend (port 3001) and frontend (port 5173) without crashes
- [x] `GET /api/health` returns `{ "status": "ok" }` (200)
- [x] Frontend loads at `http://localhost:5173` without console errors
- [x] `npm run build` succeeds for both backend and frontend
- [x] `npm run typecheck` passes with zero errors
- [x] `npm run lint` passes (fix or suppress non-critical warnings)

### Phase 1: Seed & Reset Scripts

- [x] Create `backend/src/db/seed.ts` — generates at least: 10 users (gamer-themed), 60+ posts (gaming content with game tags), threaded replies (nested 2-3 levels), likes/reposts/follows distributed realistically, notifications matching the actions, at least 3 games, gaming ranks for users
- [x] Create `backend/src/db/reset.ts` — wipes DB file then runs seed
- [x] `npm run seed` works and creates `db/data/aceverse.db.json` automatically if missing
- [x] `npm run reset` works (deletes DB, re-seeds)
- [x] Seeded data displays correctly in the frontend feeds after running `npm run seed && npm run dev`

### Phase 2: Shared Layout & Navigation

- [x] Create a shared `AppLayout` component used by all authenticated pages with 3-column desktop layout: left sidebar (nav + your games), center content, right sidebar (ranks, friends online, who to follow, trending)
- [x] Left sidebar shows: user avatar + @username + follower count, nav links (Home, Trending, Profile) with active state using `#EF8C60`, "Your Games" section with game icons/names
- [x] Right sidebar shows: "Your Ranks" with per-game rank + badge icon, "Friends Online" with green online dots, "Who to Follow" with Follow buttons, "Trending" hashtags with post counts
- [x] Mobile layout: bottom tab bar (Home, Trending, Search, Notifications, Profile), floating compose FAB button, collapsible sidebars
- [x] Navigation links work and highlight the active page with `#EF8C60` accent
- [x] Wrap all authenticated pages (Home, Explore, Trending, Search, Notifications, Profile, PostThread) in `AppLayout`
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 3: Gaming Identity — Games & Ranks

- [x] Verify `Game` model in DB types: `{ id, name, slug, iconUrl, color }` — at least: Valorant, Counter-Strike 2, Apex Legends, League of Legends, Rocket League, Super Smash Bros, Fortnite
- [x] Verify `UserGame` model: `{ id, userId, gameId, rank, rankTier, updatedAt }` — links users to games with rank
- [x] Verify `gameTag` field on `Post` model — optional game slug that tags a post to a specific game
- [x] Verify `gamesRepo` and `userGamesRepo` with CRUD operations
- [x] Backend: `GET /api/games` returns all games, `GET /api/users/:username/games` returns user's games + ranks, `PUT /api/users/:username/games` updates game ranks — add routes if missing
- [x] Profile page shows "Gaming Ranks" section with game icon, game name, rank name (e.g., "Immortal 3", "Global Elite", "Master"), rank badge, and last-updated date
- [x] Posts can be tagged with a game — post composer has optional game tag selector, PostCard shows game badge/pill
- [x] "Your Games" sidebar section shows the logged-in user's tracked games with quick links
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 4: Complete Auth Flow

- [x] Register page: username, email, password, display name — validates, shows inline errors, redirects to home on success
- [x] Login page: email + password — validates, shows inline errors, redirects to home on success
- [x] Logout works and redirects to landing page
- [x] Session cookie is HttpOnly, authenticated state persists on page refresh (`GET /api/auth/me`)
- [x] Protected pages redirect to `/login` if not authenticated
- [x] Auth forms have clean UI with `#EF8C60` accent buttons, loading states, and error toasts
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 5: Landing Page (Logged-Out Experience)

- [x] Create a stunning landing page at `/` for logged-out users with: hero section with animated gradient/glow using `#EF8C60`, tagline like "Your gaming universe. One feed.", prominent Sign Up and Login CTAs
- [x] Landing page has smooth scroll animations (fade-in, slide-up on scroll) using CSS animations or Framer Motion
- [x] Feature showcase sections: "Track Your Ranks", "Share Your Clips", "Find Your Squad", "Stay in the Loop" — each with icon/illustration and description
- [x] Social proof / stats section (e.g., "Join 50K+ gamers", "1M+ clips shared" — fake numbers, looks good)
- [x] Footer with links: About, Help, Terms, Privacy
- [x] Visiting `/p/:postId` while logged out shows the post thread read-only (no interaction buttons), with a banner prompting login
- [x] Landing page is fully responsive and looks great on mobile
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 6: Home & Explore Feeds

- [x] Home feed (`/`) shows posts from people the user follows + own posts, sorted by newest first, with cursor pagination and infinite scroll
- [x] Explore feed (`/explore`) shows all posts globally, sorted by newest
- [x] Feed uses skeleton loading cards while fetching
- [x] Empty state for home feed when following nobody: "Your feed is empty. Follow some gamers to see their posts!" with suggested accounts
- [x] Post composer at top of home feed: textarea (500 char limit), optional game tag selector, character counter, Post button disabled when empty, `#EF8C60` Post button
- [x] New posts appear instantly (optimistic update) at the top of the feed
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 7: Posts — Full CRUD

- [x] Create post works: text content (max 500 chars), optional game tag
- [x] PostCard displays: avatar, display name, @username, relative timestamp (e.g., "3h ago"), content, game tag pill, action row (reply count, like count, repost count, share)
- [x] Edit post: author-only, inline edit mode with Save/Cancel
- [x] Delete post: author-only, soft delete, shows "This post has been deleted" placeholder
- [x] Clicking a post navigates to thread view (`/p/:postId`)
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 8: Likes & Reposts

- [x] Like/unlike a post with optimistic UI — heart fills `#EF8C60`, count updates instantly
- [x] Repost/unrepost with optimistic UI — repost icon highlights, count updates instantly
- [x] No double likes or double reposts (repo constraint enforced)
- [x] Like creates a LIKE notification for the post author (not self)
- [x] Repost creates a REPOST notification for the post author (not self)
- [x] Add `api.posts.like`, `api.posts.unlike`, `api.posts.repost`, `api.posts.unrepost` to frontend API client if missing
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 9: Replies & Threads

- [x] Thread page (`/p/:postId`) shows: root post at top, reply composer below it, replies listed chronologically
- [x] Reply to a post — reply appears optimistically
- [x] Reply to a reply (nested) — indented in thread, max visible depth of 6
- [x] Edit/delete reply: author-only, soft delete shows placeholder
- [x] Reply creates a REPLY notification for the post author (and optionally parent reply author)
- [x] Add `api.posts.reply(postId, { content })` and `api.replies` (nested reply, edit, delete) to frontend API client
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 10: Follows & Profile

- [x] Full profile page (`/u/:username`): cover image area, avatar, display name, @username, bio, join date, follower/following counts
- [x] "Gaming Ranks" section on profile showing all games + ranks with icons and badges
- [x] User's posts tab on profile — paginated feed of their posts
- [x] Follow/unfollow button (not shown on own profile): toggles instantly, updates follower count
- [x] "Edit Profile" button on own profile (at minimum: update display name, bio, avatar URL)
- [x] Follow creates a FOLLOW notification for the followed user
- [x] Add `api.users` to frontend API client: `getProfile`, `getPosts`, `follow`, `unfollow`, `updateProfile`, `getGames`, `updateGames`
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 11: Notifications

- [x] Notifications page (`/notifications`): lists all notifications (LIKE, REPLY, REPOST, FOLLOW) with actor avatar, action text, relative time, and link to relevant post/profile
- [x] Unread notification count badge in the nav bar (orange dot or number)
- [x] "Mark all as read" button clears unread state
- [x] Notification dropdown on bell icon click (in addition to full page) showing latest 5 notifications with "View all notifications" link
- [x] No notifications for your own actions on your own content
- [x] Add `api.notifications` to frontend API client: `getAll`, `markAllRead`, `getUnreadCount`
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 12: Search

- [x] Search page (`/search`) with search input and debounced queries (300ms)
- [x] Search tabs: "Top" (mixed), "People" (users), "Latest" (posts by recency)
- [x] User results show avatar, display name, @username, bio snippet, Follow button
- [x] Post results show standard PostCard
- [x] Empty state: "No results for 'query'" with suggestions
- [x] Search also accessible via the search bar in the top nav / right sidebar
- [x] Add `api.search` to frontend API client
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 13: Share & Public Access

- [x] Share button on every PostCard copies the canonical link (`/p/:postId`) to clipboard with a toast confirmation
- [x] `/p/:postId` is accessible to logged-out users as read-only (shows post + replies, no action buttons)
- [x] Logged-out thread view shows a banner: "Log in to like, reply, and repost" with login link
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 14: Trending Page

- [x] Trending page (`/trending`) shows "Trending Clips" header with stats (Hot Clips count, Total Likes, last updated)
- [x] Posts ranked by engagement (likes + reposts + replies) with rank numbers (#1, #2, #3, etc.)
- [x] Game filter in left sidebar: click a game to filter trending posts by that game tag, "Clear" button to reset, selected games highlighted with `#EF8C60`
- [x] YouTube link detection: if a post contains a YouTube URL, render an embedded player in the PostCard
- [x] Trending section in right sidebar shows top 5 hashtags/game tags with post counts
- [x] Backend: `GET /api/timeline/trending?cursor=&game=` — posts ranked by engagement, optional game filter
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 15: Animations & Polish

- [ ] Page transitions: smooth fade/slide animations when navigating between pages (use Framer Motion — install with `npm install framer-motion -w frontend`)
- [ ] Micro-interactions: like heart bounce, repost icon spin, follow button pulse
- [ ] Skeleton loading cards on all feeds and profile while data loads
- [ ] Toast notifications for: post created, post deleted, link copied, error messages — using `#EF8C60` accent
- [ ] Hover effects on all interactive elements (buttons glow, cards lift slightly)
- [ ] Smooth scroll-to-top when navigating to a new page
- [ ] Loading spinners on all async actions (follow, like, post creation)
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 16: Tests

- [ ] Create `backend/src/__tests__/auth.test.ts` — test register, login, logout, me (at least 4 tests)
- [ ] Create `backend/src/__tests__/posts.test.ts` — test create, get, update, delete, like, unlike (at least 6 tests)
- [ ] Create `backend/src/__tests__/timeline.test.ts` — test home feed (following-based), explore feed (at least 3 tests)
- [ ] Create `backend/src/__tests__/users.test.ts` — test get profile, follow, unfollow (at least 3 tests)
- [ ] `npm test` passes all tests
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all still pass

### Phase 17: Final Verification

- [ ] `npm install` — clean install, no errors
- [ ] `npm run seed` — seeds DB with realistic gaming data
- [ ] `npm run dev` — both servers start, no crashes, frontend loads at localhost:5173
- [ ] `npm run build` — builds both workspaces successfully
- [ ] `npm run typecheck` — zero type errors
- [ ] `npm run lint` — passes
- [ ] `npm test` — all tests pass
- [ ] Manual QA: register user A, post 3 gaming posts with game tags, register user B, follow A, B's home feed shows A's posts, B likes/reposts A's post, A sees notifications, search works, share link works, logged-out view works, trending page shows ranked posts
- [ ] Grep this file for `"[ ]"` — confirm zero unchecked items remain (excluding this line)

---

## API Endpoints (Complete Reference)

All inputs validated with Zod. Protected endpoints require session cookie.

### Auth
- `POST /api/auth/register` — `{ username, email, password, displayName? }`
- `POST /api/auth/login` — `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me` — returns current user or null

### Timeline
- `GET /api/timeline/home?cursor=` — posts from following + self
- `GET /api/timeline/explore?cursor=` — all posts globally
- `GET /api/timeline/trending?cursor=&game=` — posts ranked by engagement, optional game filter

### Posts
- `POST /api/posts` — `{ content, gameTag? }`
- `GET /api/posts/:postId` — post + replies tree
- `PATCH /api/posts/:postId` — `{ content }` (author only)
- `DELETE /api/posts/:postId` — soft delete (author only)
- `POST /api/posts/:postId/like`
- `DELETE /api/posts/:postId/like`
- `POST /api/posts/:postId/repost`
- `DELETE /api/posts/:postId/repost`
- `POST /api/posts/:postId/replies` — `{ content }`

### Replies
- `POST /api/replies/:replyId/replies` — `{ content }`
- `PATCH /api/replies/:replyId` — `{ content }` (author only)
- `DELETE /api/replies/:replyId` — soft delete (author only)

### Users
- `GET /api/users/:username` — profile + counts
- `GET /api/users/:username/posts?cursor=`
- `POST /api/users/:username/follow`
- `DELETE /api/users/:username/follow`
- `GET /api/users/:username/games` — user's games + ranks
- `PUT /api/users/:username/games` — update own game ranks
- `PATCH /api/users/:username` — update own profile `{ displayName?, bio?, avatarUrl? }`

### Games
- `GET /api/games` — all available games

### Notifications
- `GET /api/notifications?cursor=`
- `POST /api/notifications/mark-all-read`
- `GET /api/notifications/unread-count`

### Search
- `GET /api/search?q=&type=top|people|latest`

### Response Shape

Every Post in API responses includes viewer-specific flags:

```json
{
  "id": "...",
  "content": "...",
  "gameTag": "valorant",
  "author": {
    "username": "...",
    "displayName": "...",
    "avatarUrl": "..."
  },
  "likeCount": 42,
  "replyCount": 7,
  "repostCount": 12,
  "likedByMe": true,
  "repostedByMe": false,
  "canEdit": false,
  "canDelete": false,
  "createdAt": "...",
  "deleted": false
}
```

---

## Database Schema

### Models (in `backend/src/db/types.ts`)

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  gameTag: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface Reply {
  id: string;
  postId: string;
  parentReplyId: string | null;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Repost {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'LIKE' | 'REPLY' | 'REPOST' | 'FOLLOW';
  actorId: string;
  postId: string | null;
  replyId: string | null;
  read: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  iconUrl: string;
  color: string;
}

export interface UserGame {
  id: string;
  userId: string;
  gameId: string;
  rank: string;
  rankTier: string;
  updatedAt: string;
}

export interface Database {
  users: User[];
  posts: Post[];
  replies: Reply[];
  likes: Like[];
  reposts: Repost[];
  follows: Follow[];
  notifications: Notification[];
  sessions: Session[];
  games: Game[];
  userGames: UserGame[];
}
```

---

## Target File Structure

```
aceverse/
├── .env.example
├── package.json
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
│       ├── lib/api.ts
│       ├── components/
│       │   ├── AppLayout.tsx
│       │   ├── LeftSidebar.tsx
│       │   ├── RightSidebar.tsx
│       │   ├── BottomNav.tsx
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
```
