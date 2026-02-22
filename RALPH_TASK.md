Task: AceVerse (X-inspired Full-Stack Social App)

Build a complete full-stack social media app called AceVerse that feels like X (layout + flows), without copying X branding/assets/code. It must fully work end-to-end, including auth, timelines, posting, replies/threads, likes, reposts, follows, profiles, search, notifications, and share links.

Key branding rule:

Use #EF8C60 as the primary accent across the whole app (buttons, active nav, links, highlights, focus rings, badges, like/repost hover states, etc.)

Include light mode and dark mode, both must look good with this accent.

This must run locally with no database setup, using a fake DB layer that persists to a local JSON file. Later I can replace it with a real DB.

Repo Structure (Required)

frontend/

Vite + React + TypeScript + Tailwind

React Query (or SWR) for data fetching and optimistic updates

backend/

Node + TypeScript API server (Express or Fastify)

Cookie-based sessions (HttpOnly)

Zod validation

db/

data/aceverse.db.json (created automatically)

seed script to populate fake data

root scripts

one command to install

one command to run dev

one command to run test/typecheck/lint/build

Must include:

root package.json with workspaces (or a simple root script runner)

.env.example with safe defaults (ports, session secret)

Fake DB Requirement (Critical)

Implement a swap-ready DB abstraction:

All data operations go through repository modules

Backed by in-memory state + persisted JSON on disk

Writes flush to disk (debounced is fine)

Must enforce uniqueness constraints in repos

Required repos:

usersRepo

postsRepo

repliesRepo

likesRepo

repostsRepo

followsRepo

notificationsRepo

sessionsRepo

Required constraints:

unique username

unique email

unique like per (userId, postId)

unique repost per (userId, postId)

unique follow per (followerId, followingId)

IDs:

Use UUIDs for all entities

Soft delete:

posts and replies should support deletedAt, and UI should display placeholders for deleted content

Pagination:

Feeds and notifications must support cursor pagination (preferred) or offset pagination

Seed:

A seed script that generates at least:

10 users

60 posts

threaded replies (nested)

likes, reposts, follows

notifications generated realistically

UI/UX Requirements (X-like Feel, Original Styling)

Desktop layout:

Left sidebar: Home, Explore, Search, Notifications, Profile, Compose

Center: feed + composer

Right sidebar: search box, “Who to follow”, “Trending” (fake)

Mobile layout:

Bottom nav: Home, Explore, Search, Notifications, Profile

Floating compose button

Everything thumb-friendly

Design rules:

Primary accent is #EF8C60 everywhere it matters

Neutral background, subtle dividers, clean typography

Good loading states: skeleton cards for feed

Toasts for success/error

Empty states for no posts/no followers/no notifications

Pages:

/login

/register

/home (or / as Home)

/explore

/search

/notifications

/u/:username (profile)

/p/:postId (thread view)

Feature Requirements (Must Work)
1) Auth

Register: username, email, password

Login: email + password

Logout

Password hashing: bcrypt or argon2

Sessions: HttpOnly cookie, stored in sessionsRepo

Protected actions require auth (posting, replying, liking, reposting, following, notifications mark read)

2) Posts (“Aces”)

Create post: text max 280 chars

Edit post: author only

Delete post: author only, soft delete

Post card shows:

avatar, displayName, @username, timestamp

content

counts: replies, likes, reposts

actions row: reply, repost, like, share (copy link)

3) Replies and Threads

Reply to a post

Reply to a reply (nested)

Thread page shows:

root post

replies chronologically

nested replies indented, cap visible depth at 6 (still store deeper, just clamp UI)

Edit/delete reply: author only, soft delete

4) Likes

Like/unlike a post

Optimistic updates (no refresh needed)

Like count updates instantly

Prevent double likes (repo constraint)

5) Reposts

Repost/unrepost a post

Optimistic updates

Prevent duplicate reposts

Repost count updates instantly

Optional nice-to-have:

quote repost, but only after core works

6) Follows

Follow/unfollow users

Follow state reflected immediately on profile

Home feed is based on following graph:

posts from people you follow + your own

if following none, show a friendly empty state + suggested accounts

7) Timelines

Home timeline: following

Explore timeline: global latest

Infinite scroll or Load More with pagination

8) Notifications

Types: LIKE, REPLY, REPOST, FOLLOW

Notifications page:

unread badge count in nav

mark all as read

Trigger rules:

No notifications for your own actions on your own content

Like notifies post author

Reply notifies post author (and optionally parent reply author)

Repost notifies post author

Follow notifies followed user

9) Search

Search input with debounce

Search users by username/displayName

Search posts by content

Basic filters (tabs): Top / People / Latest (simple is fine)

10) Share Links

Share button copies a canonical link to the post thread page

Visiting /p/:postId works for logged-out users (read-only), but interactions require login

API Requirements (High Level)

Implement REST endpoints (exact naming can vary, but must cover all actions). All inputs validated with Zod. All protected endpoints require session auth.

Auth:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/me

Timelines:

GET /api/timeline/home?cursor=...

GET /api/timeline/explore?cursor=...

Posts:

POST /api/posts

GET /api/posts/:postId

PATCH /api/posts/:postId

DELETE /api/posts/:postId

POST /api/posts/:postId/like

DELETE /api/posts/:postId/like

POST /api/posts/:postId/repost

DELETE /api/posts/:postId/repost

POST /api/posts/:postId/replies

Replies:

POST /api/replies/:replyId/replies

PATCH /api/replies/:replyId

DELETE /api/replies/:replyId

Users:

GET /api/users/:username

GET /api/users/:username/posts?cursor=...

POST /api/users/:username/follow

DELETE /api/users/:username/follow

Notifications:

GET /api/notifications?cursor=...

POST /api/notifications/mark-all-read

Search:

GET /api/search?q=...&type=top|people|latest

Response shaping rule:

Every Post returned must include viewer-specific flags so the UI can render instantly:

likedByMe, repostedByMe, isFollowingAuthor (or authorFollowedByMe), canEdit, canDelete

Styling Requirements (Accent Enforcement)

Implement a single source of truth for theme tokens:

primary accent: #EF8C60

use it for:

primary buttons

active nav item

links

focus ring

notification badge

hover highlight states

composer “Post” button

selected tab underline

Tailwind approach:

add CSS variables and tailwind config so “primary” maps to #EF8C60

never hardcode random oranges elsewhere, everything routes through primary token

Local Dev Requirements (No Manual Setup)

AceVerse must work with these commands:

Install

npm install

Run dev (starts backend + frontend together)

npm run dev

Reset data + seed

npm run seed (must create db file automatically if missing)

npm run reset (optional, wipes db then seeds)

No Docker required. No external services required.

Success Criteria Checklist (Ralph)

 [x] Repo has frontend/ backend/ db/ and root scripts, dev runs both servers together

 Fake DB JSON file auto-creates and persists changes across restarts

 Register/login/logout works, passwords hashed, sessions via HttpOnly cookies

 Home and Explore feeds load with pagination and nice loading states

 Creating a post works, shows instantly, respects 280 char limit

 Editing and deleting posts works with correct permissions

 Thread page (/p/:postId) works and displays replies + nested replies

 Replying to a post and replying to a reply works

 Likes toggle works, optimistic updates, correct counts, no double likes

 Reposts toggle works, optimistic updates, correct counts, no duplicate reposts

 Follow/unfollow works, updates UI instantly, home feed depends on following

 Profile page (/u/:username) shows bio, counts, posts list, follow button state

 Search works for users and posts with debounce

 Notifications work (like/reply/repost/follow), unread badge, mark all read

 Share button copies link, logged-out users can view post thread read-only

 App looks X-like in layout, is mobile-friendly, dark mode looks good

 #EF8C60 is used as the global primary accent everywhere important

 npm run test passes (at least API smoke tests for auth + posting + like)

 npm run typecheck passes

 npm run lint passes

 npm run build passes for frontend and backend

Example Manual QA Flow (Must Verify)

Create user A, login, post 3 posts

Create user B, login, follow user A

User B home feed shows A’s posts

User B likes and reposts A’s post, notifications appear for A

User B replies to A’s post, thread view shows reply

User A checks notifications badge, opens notifications, mark all read works

Search “A” shows user A, search a post word shows the post

Open /p/:postId while logged out shows read-only thread

If any step is broken, fix it before completion.

Ralph Instructions

Work on the next incomplete criterion (marked [ ])

Check off completed criteria (change [ ] to [x])

Run the test_command after meaningful changes

Commit frequently with small commits

When ALL criteria are [x], output: <ralph>COMPLETE</ralph>

If stuck on the same issue 3+ times, output: <ralph>GUTTER</ralph>