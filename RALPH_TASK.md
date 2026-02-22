---
task: "AceVerse — UI/UX Polish & Light/Dark Mode"
test_command: "npm run typecheck && npm run build && npm test"
---

# Task: AceVerse UI/UX Overhaul

The core MVP is fully functional (auth, posts, feeds, likes, reposts, replies, follows, profiles, notifications, search, trending, share). This iteration is purely about making the UI/UX **beautiful** — matching the design mockups in `.ralph/image.png`, `.ralph/image copy.png`, and `.ralph/image copy 2.png` exactly. Proper theming, consistent design tokens, real SVG icons, smooth interactions, and a proper light/dark mode toggle.

## CRITICAL RULES FOR RALPH

> **READ THIS FIRST. These rules override everything else.**
>
> 1. **LOOK AT THE MOCKUPS.** Read the three image files in `.ralph/` — `image.png` (home feed), `image copy.png` (profile page), `image copy 2.png` (trending page). These are the design targets. Match them as closely as possible.
> 2. Count the checkboxes below. You are **NOT DONE** until **EVERY SINGLE ONE** is `[x]`. Grep for `"- [ ]"` before signaling complete.
> 3. **DO NOT** output `<ralph>COMPLETE</ralph>` unless zero `- [ ]` remain in this file.
> 4. After **every phase**, run: `npm run typecheck && npm run build && npm run lint`. Fix any errors before moving on.
> 5. **DO NOT break existing functionality.** Every backend API must still work. Every page must still load. Auth must still work. All existing features must remain functional.
> 6. Run `npm test` at the end — all existing tests must still pass.
> 7. Work phases **in order**. Complete ALL criteria in a phase before starting the next.
> 8. Install dependencies as needed: `npm install <pkg> -w frontend` or `-w backend`.
> 9. Commit after each completed phase with a descriptive message.
> 10. If stuck on the same issue 3+ times, output: `<ralph>GUTTER</ralph>`

## Context

### What's Already Built (DO NOT REBUILD)
- Full backend API: auth, posts, replies, users, timeline (home/explore/trending), notifications, search, games — all working
- Frontend: all pages functional (Landing, Login, Register, Home, Explore, Trending, Search, Notifications, Profile, PostThread)
- Components: AppLayout (3-column), LeftSidebar, RightSidebar, BottomNav, Feed, PostCard, PostComposer, PostCardSkeleton, NotificationDropdown, GameTagSelector, RankBadge, FollowButton, Toast, YouTubeEmbed
- Framer Motion installed for animations
- 17 backend tests passing
- Seed data with 10 users, 60+ posts, games, ranks

### Current UI Problems to Fix
1. **No light mode** — everything is hardcoded dark (`bg-[#0D0D0D]`, `bg-[#1A1A1A]`, `bg-[#242424]`) with no toggle
2. **Emoji icons** — nav and actions use emoji instead of proper SVG icons
3. **Hardcoded colors** — scattered inline Tailwind classes instead of CSS variables / theme tokens
4. **Inconsistent styling** — some components use `dark:` prefix, others hardcode dark colors
5. **Basic hover/focus states** — missing polish on interactive elements
6. **Typography** — inconsistent font sizes, weights, spacing
7. **Mobile polish** — bottom nav works but lacks refinement
8. **Doesn't match the mockups** — layout structure is right but visual details are off

---

## Visual Design Specification (from mockups)

> Ralph: READ the `.ralph/image.png`, `.ralph/image copy.png`, `.ralph/image copy 2.png` files for the visual targets. Below is a detailed text description of what they show.

### Top Navigation Bar (all pages)
- **Left**: Aceverse flame/A logo icon (orange `#EF8C60`) + "Aceverse" text in white/bold
- **Center-left nav links**: "Home" (with house icon), "Trending" (with flame/trending icon) — text links with icons, active one highlighted in accent
- **Center**: Search bar — rounded pill, gray background, magnifying glass icon, placeholder "Search users, posts, games..."
- **Right**: Orange "Post" button (rounded-full, pen/edit icon + "Post" text), bell notification icon (with orange dot when unread), user avatar (rounded-full)

### Left Sidebar
- **Top**: User avatar (48px round) + @username + "XX followers" count below
- **Nav links** (vertical stack, each with icon + label):
  - Home (house icon) — orange/accent when active
  - Trending (flame icon)
  - Profile (user icon)
- **"Your Games" section** (with gamepad icon header):
  - Each game: colored game icon/logo + game name
  - Games listed: Valorant (red), Counter-Strike 2 (green), Apex Legends (red)
  - Each game row is clickable
- **Footer**: "About  Help  Terms  Privacy" links + "© 2024 Aceverse"

### Post Card (Feed Items)
- **Layout**: Avatar (40px round) on left, content area on right
- **Header line**: @username (bold) + relative time ("6h ago") on right + three-dot "..." menu (far right)
- **Content**: Post text, natural line spacing
- **Game tag**: Small rounded pill below content — colored game icon + game name (e.g., red square + "Valorant"), background slightly tinted
- **YouTube embed**: If post has YouTube link, embedded player with rounded corners below content
- **Action row** (bottom): Four icon+count groups evenly spaced:
  - Heart icon + like count (e.g., "8.9K")
  - Comment/reply icon + reply count (e.g., "567")
  - Repost icon + repost count (e.g., "1.2K")
  - Share/upload icon (right-most, no count)
- **Divider**: Subtle 1px line between posts, no card gap/margin

### Post Composer (top of home feed)
- Avatar on left, textarea on right
- Placeholder: "What's happening in your games?"
- **Bottom toolbar**: Row of icon buttons (image, grid/poll, game controller, emoji), then "0/500" character count, then orange "Post" button (rounded-full)

### Right Sidebar
- **"Your Ranks" section** (gamepad icon + header):
  - Each row: Game icon + game name + rank name in orange accent text (e.g., "Immortal 3") + small rank badge icon on right
  - Ranks shown: Valorant "Immortal 3", Counter-Strike 2 "Global Elite", Apex Legends "Master"
  - "View all games →" link at bottom in accent color
- **"Friends Online" section** (users icon + header):
  - Each row: Avatar (32px) + @username + "Online" text with green dot
  - Shows 4 friends online
- **"Who to Follow" section** (user-plus icon + header):
  - Each row: Avatar + @username + "XX,000 followers" below + orange "Follow" button (rounded-full, accent border/bg)
  - Shows 5 suggestions
- **"Trending" section** (trending-up icon + header):
  - Each row: Hashtag name (bold, like "#ValorantClips") + "XXX+ posts" count below in secondary text
  - Shows 5 trending tags

### Profile Page (`.ralph/image copy.png`)
- **Cover image**: Full-width banner image (dark, gaming-themed) at top
- **Avatar**: Large (128px) round avatar, overlapping the cover image bottom edge
- **Name area**: @username (large, bold) + display name below, "Edit Profile" button (right-aligned, outline style) on own profile
- **Bio**: Full bio text below name
- **Stats line**: "156 Posts  6 Followers  7 Following  📅 Joined Jan 15" — all on one line
- **"Gaming Ranks" section**: Header with "View all (5) ▼" toggle
  - Each rank row: Large colored game icon (48-56px), game name, rank name in large orange text (e.g., "Immortal 3"), small rank badge on right, "Updated Jan 15" date on far right
  - Ranks in card-like rows with subtle background
- **Tabs**: "Posts" | "Clips" | "Likes" — horizontal tabs below ranks, active tab has orange underline
- **Posts feed**: User's posts listed below tabs

### Trending Page (`.ralph/image copy 2.png`)
- **Header area**: Fire/trending icon + "Trending Clips" title (large bold) + "Top gaming clips from the community" subtitle
- **Stats bar**: Three stat cards in a row:
  - Fire icon + "11+" + "Hot Clips"
  - Chart icon + "44K+" + "Total Likes"
  - Clock icon + "24h" + "Updated"
- **Ranked posts**: Each post has a ranking badge — circular orange badge with "#1", "#2", "#3" overlapping the top-left of the post card
- **Game filter**: In the left sidebar "Your Games" section, games are clickable to filter trending by game tag, with a "Clear" option when filtering

---

## Success Criteria

### Phase 1: Design Token System & CSS Variables

- [x] Create a CSS variable system in `index.css` with theme tokens for both light and dark modes:
  - `--color-bg-primary` (page background): light `#FFFFFF` / dark `#000000`
  - `--color-bg-secondary` (cards, sidebars): light `#F7F9F9` / dark `#16181C`
  - `--color-bg-tertiary` (hover, inputs): light `#EFF3F4` / dark `#1D1F23`
  - `--color-bg-hover` (subtle hover): light `rgba(0,0,0,0.03)` / dark `rgba(255,255,255,0.03)`
  - `--color-border` (dividers): light `#EFF3F4` / dark `#2F3336`
  - `--color-text-primary`: light `#0F1419` / dark `#E7E9EA`
  - `--color-text-secondary`: light `#536471` / dark `#71767B`
  - `--color-text-tertiary`: light `#8B98A5` / dark `#536471`
  - `--color-accent`: `#EF8C60` (both modes)
  - `--color-accent-hover`: `#E07840` (both modes)
  - `--color-like`: `#F91880` (pink, both modes)
  - `--color-repost`: `#00BA7C` (green, both modes)
  - `--color-reply`: `#1D9BF0` (blue, both modes)
- [x] Update `tailwind.config.js` to map these CSS variables to Tailwind utility classes (e.g., `bg-primary`, `text-primary`, `border-default`, `text-accent`, `bg-hover`)
- [x] Light mode activates when `<html>` has no `dark` class; dark mode when it does — Tailwind `darkMode: 'class'`
- [x] Replace ALL hardcoded color values (`bg-[#0D0D0D]`, `bg-[#1A1A1A]`, `bg-[#242424]`, `text-[#EF8C60]`, etc.) across every component and page with the new Tailwind token classes
- [x] After this phase, the app should look identical in dark mode (no visual regressions) and acceptable in light mode (colors all swap correctly)
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 2: Light/Dark Mode Toggle

- [x] Create a `useTheme` hook that manages theme state (`'light' | 'dark' | 'system'`), persists to `localStorage`, applies/removes `dark` class on `<html>`
- [x] System preference detection: if `'system'`, follow `prefers-color-scheme` and listen for changes
- [x] Add theme toggle button in LeftSidebar (below nav links) — sun icon (light), moon icon (dark), monitor icon (system) — cycles on click
- [x] Add the same toggle accessible on mobile (in BottomNav or settings)
- [x] Smooth icon transition on toggle, no flash of wrong theme on page load
- [x] Prevent FOUC: add inline `<script>` in `index.html` that reads localStorage and applies `dark` class before React hydrates
- [x] Verify: light mode — entire app renders with light backgrounds, dark text, accent intact
- [x] Verify: dark mode — entire app renders with dark backgrounds, light text
- [x] Verify: system mode — follows OS preference
- [x] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 3: Icon System (Replace All Emojis with Lucide SVGs)

- [ ] Install `lucide-react` (`npm install lucide-react -w frontend`)
- [ ] Replace ALL emoji icons in `LeftSidebar`: Home (house), Flame (trending), User (profile), Gamepad2 (your games header) — outline default, filled/bold when active page
- [ ] Replace ALL emoji icons in `BottomNav`: matching icons for Home, Flame, Search, Bell, User
- [ ] Replace ALL emoji icons in `PostCard` action row: Heart (like, filled when liked), MessageCircle (reply), Repeat2 (repost), Share or Upload (share) — with proper hover color per action
- [ ] Replace ALL emoji icons in `RightSidebar`: Search, Gamepad2 (ranks header), Users (friends header), UserPlus (who to follow header), TrendingUp (trending header), game-specific icons
- [ ] Replace ALL emoji icons in `NotificationDropdown` and `NotificationsPage`: Heart (like), MessageCircle (reply), Repeat2 (repost), UserPlus (follow)
- [ ] Replace ALL emoji icons in `PostComposer`: Image, LayoutGrid, Gamepad2, Smile — matching the toolbar from the mockup
- [ ] Replace ALL remaining emojis in GameTagSelector, ProfilePage (Calendar, Edit, MapPin etc.), SearchPage, TrendingPage (Flame, TrendingUp, Clock)
- [ ] Consistent sizing: 18-20px in action rows, 20-24px in navigation, 16px inline
- [ ] Active nav: filled variant; inactive: outline variant. Colors use theme tokens.
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 4: Top Navigation Bar (Match Mockup Exactly)

- [ ] Create a persistent top nav bar visible on all authenticated pages (part of AppLayout):
  - **Left**: Aceverse logo (flame icon in accent + "Aceverse" bold text) — links to home
  - **Center-left**: "Home" link (Home icon + text), "Trending" link (Flame icon + text) — active one highlighted in accent color
  - **Center**: Search input (rounded-full pill, bg-tertiary, Search icon inside, placeholder "Search users, posts, games...")— typing and pressing enter navigates to /search?q=...
  - **Right**: Orange "Post" button (Edit/Pen icon + "Post" text, bg-accent text-white rounded-full) — opens compose modal or navigates to composer, Bell icon (with orange unread dot badge overlaid when notifications exist), User avatar (32px round, links to profile)
- [ ] Top nav is sticky, has subtle bottom border, backdrop blur on scroll
- [ ] Notification bell shows orange dot when there are unread notifications (poll or check on page load)
- [ ] Clicking the Post button in the top nav opens the existing PostComposer (either inline at top of feed or as a modal)
- [ ] Search input in top nav works: submit navigates to `/search?q=...`
- [ ] Top nav hides on mobile (replaced by bottom nav) or becomes a minimal bar with just logo + bell + avatar
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 5: PostCard — Match Mockup Exactly

- [ ] Avatar (40px rounded-full) on left, content area on right — no card border, just subtle bottom divider
- [ ] Header: @username (font-semibold, text-primary) on left, relative time (text-secondary, concise: "6h ago", "1d ago", "2w ago") on right, three-dot menu far right
- [ ] Content: text-primary, proper line-height (1.4-1.5), hashtags and @mentions highlighted in accent
- [ ] Game tag pill: small rounded badge with colored square icon + game name text, subtle tinted background matching the game's color
- [ ] YouTube embeds: rounded corners, proper 16:9 aspect ratio, "Watch on YouTube" link
- [ ] Action row: four evenly-spaced groups — Heart + count, MessageCircle + count, Repeat2 + count, Share icon (no count). Each with hover color: like=pink, reply=blue, repost=green, share=accent. Active like=filled pink heart, active repost=green filled icon. Counts in text-secondary.
- [ ] Hover state: entire card gets subtle bg-hover tint (not shadow)
- [ ] Deleted post: subtle italic text-secondary "This post has been deleted", no action row
- [ ] Edit mode: clean textarea with accent focus ring, Save/Cancel buttons
- [ ] Three-dot menu dropdown: clean bg-secondary card with border-default, edit/delete options
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 6: PostComposer — Match Mockup Exactly

- [ ] Layout: avatar (40px) on left, borderless textarea on right, grows with content
- [ ] Placeholder: "What's happening in your games?"
- [ ] Bottom toolbar (below textarea): icon buttons row (Image, LayoutGrid, Gamepad2, Smile icons — matching mockup), then character count "0/500", then orange "Post" button (rounded-full bg-accent text-white, disabled/opacity-50 when empty)
- [ ] Game tag selector: clicking Gamepad2 icon shows game dropdown, selected game appears as pill below textarea
- [ ] Character count turns orange at 400+, red at 480+
- [ ] Composer has subtle top border separating it from the feed below
- [ ] Works in both light and dark mode
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 7: Left Sidebar — Match Mockup Exactly

- [ ] **User card** at top: avatar (48px round) + @username (bold) + "XX followers" (text-secondary)
- [ ] **Nav links** (vertical, icon + label each):
  - Home (Home icon) — accent color text + filled icon when on home page
  - Trending (Flame icon) — accent when active
  - Profile (User icon) — accent when active
  - Each nav link: hover shows subtle bg-hover rounded pill background
- [ ] **"Your Games" section**: Gamepad2 icon + "Your Games" header (text-secondary, semibold), divider above
  - Each game: colored circle/square icon + game name text
  - Valorant (red icon), Counter-Strike 2 (green icon), Apex Legends (red icon)
  - Games are clickable (link to trending?game=slug or similar)
- [ ] **Footer** at bottom: "About  Help  Terms  Privacy" text links (text-tertiary, small) + "© 2024 Aceverse"
- [ ] Sidebar has subtle right border (border-default)
- [ ] Sticky positioning, scrolls independently if content overflows viewport
- [ ] Looks correct in both light and dark mode
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 8: Right Sidebar — Match Mockup Exactly

- [ ] **"Your Ranks" section**: Gamepad2 icon + "Your Ranks" header
  - Each row: game icon (colored) + game name (text-primary) + rank name in accent color (e.g., "Immortal 3" in orange) + small rank badge icon on far right
  - Show user's top 3 game ranks
  - "View all games →" link at bottom (accent text)
- [ ] **"Friends Online" section**: Users icon + "Friends Online" header
  - Each row: avatar (32px) + @username + "Online" text in green with green dot indicator
  - Show up to 4 friends (pick random seeded users as "online")
- [ ] **"Who to Follow" section**: UserPlus icon + "Who to Follow" header
  - Each row: avatar (32px) + @username (text-primary) + "XX,000 followers" (text-secondary) + orange "Follow" button (rounded-full, small, bg-accent text-white or outline with accent border)
  - Show 5 suggested users (users the current user doesn't follow)
  - Follow button actually works (calls API, updates state)
- [ ] **"Trending" section**: TrendingUp icon + "Trending" header (with flame accent)
  - Each row: hashtag/tag name (bold, text-primary, like "#ValorantClips") + "XXX+ posts" (text-secondary) below
  - Show top 5 trending tags
  - Each tag is clickable (links to search or trending filter)
- [ ] Each section is in a rounded card with bg-secondary background and subtle padding
- [ ] Sidebar has subtle left border (border-default)
- [ ] Sticky positioning, scrolls independently
- [ ] Looks correct in both light and dark mode
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 9: Profile Page — Match Mockup Exactly

- [ ] **Cover image**: Full-width, ~200px tall, dark gradient if no custom image. Edge-to-edge within the center column.
- [ ] **Avatar**: Large (128px) round, positioned to overlap the bottom of the cover image (negative margin or absolute positioning), white/dark border ring
- [ ] **Name & actions**: @username (large, bold, text-primary) + display name below (text-secondary). "Edit Profile" button (outline, rounded-full, border-default) on own profile. "Follow"/"Unfollow" button (solid bg-accent, rounded-full) on other profiles.
- [ ] **Bio**: Full bio text (text-primary), below name
- [ ] **Stats line**: "XXX Posts  X Followers  X Following  📅 Joined Jan 15" — all inline, counts in bold, labels in text-secondary, calendar icon for join date
- [ ] **Gaming Ranks section**: Section header "Gaming Ranks" + "View all (X) ▼" toggle on right
  - Each rank: large game icon (48px colored), game name (text-primary), rank name in large accent text (e.g., "Immortal 3"), rank tier badge icon on right, "Updated Jan 15" date on far right (text-secondary)
  - Rows have subtle bg-secondary background with rounded corners
- [ ] **Content tabs**: "Posts" | "Clips" | "Likes" horizontal tab bar — active tab has accent-colored underline, tabs are clickable
  - "Posts" tab shows user's post feed (existing)
  - "Clips" tab can show posts with YouTube embeds, or "Coming soon" placeholder
  - "Likes" tab can show posts the user has liked, or "Coming soon" placeholder
- [ ] User's post feed below tabs, paginated
- [ ] Entire profile looks correct in both light and dark mode
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 10: Trending Page — Match Mockup Exactly

- [ ] **Header**: Flame icon (large, accent) + "Trending Clips" title (large, bold) + "Top gaming clips from the community" subtitle (text-secondary)
- [ ] **Stats bar**: Three cards in a row (bg-secondary, rounded):
  - Fire icon + "11+" (large, bold) + "Hot Clips" (text-secondary)
  - TrendingUp icon + "44K+" (large, bold) + "Total Likes" (text-secondary)
  - Clock icon + "24h" (large, bold) + "Updated" (text-secondary)
  - Stats can be computed from actual data or hardcoded as representative numbers
- [ ] **Ranked posts**: Each trending post has a circular accent-colored badge with rank number (#1, #2, #3...) positioned overlapping the top-left corner of the post
- [ ] **Game filter**: In the left sidebar "Your Games" section, clicking a game filters the trending feed to that game's tag. Active filter game is highlighted in accent. "Clear" button resets the filter.
- [ ] YouTube embeds display properly within trending post cards
- [ ] Entire page looks correct in both light and dark mode
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 11: Remaining Pages Polish

- [ ] **Home page**: Sticky header "Home" with subtle bottom border + backdrop blur, PostComposer below, then Feed
- [ ] **Explore page**: Sticky header "Explore" with subtle bottom border, Feed showing all posts
- [ ] **Notifications page**: Clean list, each notification has: relevant icon (Heart/MessageCircle/Repeat2/UserPlus) + actor avatar + action text (e.g., "@proaimbot liked your post") + relative time. Unread items have subtle accent-left border or bg tint. "Mark all read" button in accent.
- [ ] **Search page**: Large search input at top (matching top nav search style), tab bar "Top" | "People" | "Latest" with accent underline on active, results display cleanly (PostCard for posts, user card for people)
- [ ] **Thread page**: Root post displayed prominently (slightly larger text), reply composer below, replies with vertical connector lines (thin accent or border-default line connecting avatars), nested replies indented
- [ ] **Landing page**: Verify it still works beautifully in both light/dark mode, animations still smooth
- [ ] **Login & Register pages**: Centered card (bg-secondary, rounded-xl), clean form fields (bg-tertiary, rounded-lg, accent focus ring), Aceverse logo at top, accent submit button, link to other auth page at bottom. Works in both modes.
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 12: Mobile Polish

- [ ] Bottom nav: clean icon-only bar with subtle top border (border-default), bg-primary background, active icon in accent color (filled variant), proper safe-area bottom padding
- [ ] Floating compose FAB: rounded-full accent button with Feather/Plus icon, bottom-right above nav, subtle shadow
- [ ] All pages responsive: single-column on mobile, sidebars hidden, proper padding (16px), no horizontal overflow
- [ ] PostCard: full-width, action icons have min 44px tap targets
- [ ] Profile: cover image scales, avatar scales, stats wrap properly
- [ ] Top nav on mobile: minimal — just Aceverse logo left, bell + avatar right (or hidden, replaced by bottom nav)
- [ ] Modals/dropdowns: bottom-sheet style or full-width on mobile
- [ ] Search: full-width input, results stack
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 13: Micro-Animations & Interactions

- [ ] Like: heart scales (1 → 1.3 → 1) with color transition to pink when liked
- [ ] Repost: icon rotates briefly with color transition to green
- [ ] Follow button: smooth fill transition from outline to solid accent
- [ ] New post: slides in from top with fade
- [ ] Notification badge: subtle pulse when count changes
- [ ] Theme toggle: icon crossfade/rotate on switch
- [ ] Toast: slides in from top-right with spring, slides out on dismiss
- [ ] Skeleton loading: shimmer animation (gradient sweep, not just pulse)
- [ ] All buttons: subtle brightness/scale transition on hover (transform: scale(1.02) or filter: brightness(1.1))
- [ ] Page transitions: existing framer-motion fade/slide still smooth
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 14: Typography & Spacing Consistency

- [ ] Type scale: page titles 20-24px bold, section headers 16-18px semibold, body 15px regular, secondary 13-14px, small labels 12px
- [ ] Spacing: card padding 16px, zero gap between feed items (divider only — like Twitter), sidebar sections 16-24px gap, action row even distribution
- [ ] Line-height: post content 1.4-1.5, UI text 1.25
- [ ] Truncation: long display names ellipsis, long bios "...more"
- [ ] Timestamps: concise format — "2h", "6h", "1d", "2w", "Jan 15" (not "2 hours ago")
- [ ] Border-radius: rounded-full for avatars/buttons/pills/search, rounded-xl for sidebar cards/modals, rounded-lg for form inputs
- [ ] Run `npm run typecheck && npm run build && npm run lint` — all pass

### Phase 15: Final Verification

- [ ] Dark mode: browse every page (home, explore, trending, search, notifications, profile, thread, landing, login, register) — everything polished, consistent, matches mockups
- [ ] Light mode: browse every page — everything polished, no invisible elements, all text readable
- [ ] System mode: follows OS preference correctly
- [ ] Mobile viewport: all pages usable, bottom nav works, no overflow, floating FAB visible
- [ ] All features work: register, login, logout, post, edit, delete, like, unlike, repost, unrepost, reply, follow, unfollow, search, notifications, share link, trending, game tags, theme toggle
- [ ] `npm install` — no errors
- [ ] `npm run build` — succeeds
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — passes
- [ ] `npm test` — all existing tests pass
- [ ] Zero console errors in browser on any page

---

## Quick Reference

### Color Tokens
| Token          | Light          | Dark           |
|----------------|----------------|----------------|
| bg-primary     | `#FFFFFF`      | `#000000`      |
| bg-secondary   | `#F7F9F9`      | `#16181C`      |
| bg-tertiary    | `#EFF3F4`      | `#1D1F23`      |
| bg-hover       | `rgba(0,0,0,.03)` | `rgba(255,255,255,.03)` |
| border-default | `#EFF3F4`      | `#2F3336`      |
| text-primary   | `#0F1419`      | `#E7E9EA`      |
| text-secondary | `#536471`      | `#71767B`      |
| accent         | `#EF8C60`      | `#EF8C60`      |
| like           | `#F91880`      | `#F91880`      |
| repost         | `#00BA7C`      | `#00BA7C`      |
| reply          | `#1D9BF0`      | `#1D9BF0`      |

### Button Patterns
```
Primary:    bg-accent text-white rounded-full px-5 py-2 font-bold
Secondary:  border border-default text-primary rounded-full px-4 py-1.5
Follow:     bg-accent text-white rounded-full px-4 py-1 text-sm font-bold
Ghost:      bg-transparent text-accent hover:bg-accent/10 rounded-full
```

### Nav Item Pattern
```
Inactive:  [outline icon] Label  → text-primary
Hover:     [outline icon] Label  → text-primary, bg-hover rounded-full pill
Active:    [filled icon]  Label  → text-accent font-bold
```

### Icon Sizes
```
Navigation:  20-24px (w-5 h-5 or w-6 h-6)
Action row:  18-20px (w-[18px] h-[18px] or w-5 h-5)
Inline:      16px (w-4 h-4)
Section headers: 20px (w-5 h-5)
```
