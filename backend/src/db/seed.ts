import bcrypt from 'bcryptjs';
import { resetDb } from './store.js';
import {
  gamesRepo,
  userGamesRepo,
  usersRepo,
  postsRepo,
  repliesRepo,
  likesRepo,
  repostsRepo,
  followsRepo,
  notificationsRepo,
} from './repos/index.js';

const SEED_PASSWORD = 'seedpass123';

function seedGames() {
  const games = [
    { name: 'Valorant', slug: 'valorant', iconUrl: '/icons/valorant.svg', color: '#FF4655' },
    { name: 'Counter-Strike 2', slug: 'cs2', iconUrl: '/icons/cs2.svg', color: '#F5B546' },
    { name: 'Apex Legends', slug: 'apex', iconUrl: '/icons/apex.svg', color: '#DA292A' },
    { name: 'League of Legends', slug: 'lol', iconUrl: '/icons/lol.svg', color: '#C89B3C' },
    { name: 'Rocket League', slug: 'rocketleague', iconUrl: '/icons/rocketleague.svg', color: '#FF9500' },
  ];
  return games.map((g) => gamesRepo.create(g));
}

async function seedUsers() {
  const hash = await bcrypt.hash(SEED_PASSWORD, 10);
  const users = [
    { username: 'xXValorantProXx', displayName: 'Valorant Pro', email: 'v1@aceverse.test', bio: 'Radiant main. Clutch or kick.' },
    { username: 'CS2_GlobalElite', displayName: 'Global Elite', email: 'cs2@aceverse.test', bio: 'CS2 grind never stops.' },
    { username: 'ApexPredator', displayName: 'Apex Pred', email: 'apex@aceverse.test', bio: 'Masters every season.' },
    { username: 'LoL_MidLane', displayName: 'Mid Lane Main', email: 'lol@aceverse.test', bio: 'Challenger mid.' },
    { username: 'RocketLeagueGC', displayName: 'Rocket GC', email: 'rl@aceverse.test', bio: 'Grand Champ in 2s and 3s.' },
    { username: 'ClipMaster', displayName: 'Clip Master', email: 'clip@aceverse.test', bio: 'Posting the best clips.' },
    { username: 'GamerGirl_', displayName: 'Gamer Girl', email: 'gg@aceverse.test', bio: 'Variety gamer. Mostly FPS.' },
    { username: 'NoScopeKing', displayName: 'NoScope King', email: 'noscope@aceverse.test', bio: '360 no scope only.' },
    { username: 'RankedGrinder', displayName: 'Ranked Grinder', email: 'grind@aceverse.test', bio: 'Grinding to the top.' },
    { username: 'AceVerseOG', displayName: 'AceVerse OG', email: 'og@aceverse.test', bio: 'Day one AceVerse.' },
  ];
  return users.map((u) =>
    usersRepo.create({
      username: u.username,
      email: u.email,
      passwordHash: hash,
      displayName: u.displayName,
      bio: u.bio,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`,
    })
  );
}

function seedUserGames(users: { id: string }[], games: { id: string; slug: string }[]) {
  const ranks: Record<string, string[]> = {
    valorant: ['Radiant', 'Immortal 3', 'Immortal 2', 'Immortal 1', 'Diamond 3'],
    cs2: ['Global Elite', 'Supreme', 'Legendary Eagle', 'DMG', 'Gold Nova Master'],
    apex: ['Predator', 'Master', 'Diamond', 'Platinum', 'Gold'],
    lol: ['Challenger', 'Grandmaster', 'Master', 'Diamond', 'Platinum'],
    rocketleague: ['Supersonic Legend', 'Grand Champ', 'Champ', 'Diamond', 'Platinum'],
  };
  const tier: Record<string, string> = {
    valorant: 'radiant',
    cs2: 'global',
    apex: 'predator',
    lol: 'challenger',
    rocketleague: 'ssl',
  };
  users.forEach((user) => {
    games.slice(0, 3).forEach((game, j) => {
      const r = ranks[game.slug as keyof typeof ranks];
      const t = tier[game.slug as keyof typeof tier];
      if (r && t) userGamesRepo.upsert(user.id, game.id, r[j % r.length] ?? r[0], t);
    });
  });
}

function seedPosts(users: { id: string }[], games: { id: string; slug: string }[]) {
  const contents = [
    'Just hit Radiant for the first time! So hyped.',
    'That 1v4 clutch in overtime though.',
    'New meta in CS2 is insane. Loving the changes.',
    'Apex ranked is so sweaty this split.',
    'Anyone else grinding LoL ranked before season end?',
    'Rocket League SSL here I come.',
    'Best clip of the week - 5k in Valorant.',
    'CS2 Premier rating finally above 20k.',
    'Apex Predator lobby is another level.',
    'LoL solo queue tilts me but I keep coming back.',
    'RLCS vibes. What a match.',
    'Valorant agent meta shift is real.',
    'Global Elite achieved. Next stop: Faceit 10.',
    'Apex team comp meta discussion - who do you run?',
    'League patch notes dropped. Mid lane changes look good.',
    'Rocket League mechanics practice paying off.',
    'Another day another ace in Valorant.',
    'CS2 economy guide - when to force buy.',
    'Apex ranked reset - time to climb again.',
    'LoL jungle pathing 2024.',
    'RL 1v1 is the true test.',
    'Valorant smoke lineup for Ascent A.',
    'CS2 AWP tips from a main.',
    'Apex movement tech you need to know.',
    'League macro for low elo.',
    'Rocket League rotation basics.',
    'Clutch round in Valorant - comms were key.',
    'CS2 team play > solo queue.',
    'Apex third party meta.',
    'LoL objective control.',
    'RL demo plays.',
    'Valorant duelist diff.',
    'CS2 entry fragger role.',
    'Apex support legends underrated.',
    'League teamfight setup.',
    'Rocket League ceiling shots.',
    'Ranked grind never stops.',
    'LFG for Valorant comp.',
    'CS2 faceit vs MM.',
    'Apex ranked rewards this season.',
    'LoL clash this weekend.',
    'RL private match anyone?',
    'VCT watch party tonight!',
    'Major qualifiers are insane.',
    'ALGS finals were crazy.',
    'Worlds meta is settling.',
    'RLCS major hype.',
    'New Valorant map when?',
    'CS2 map pool rotation.',
    'Apex new legend teaser.',
    'LoL new champion reveal.',
    'Rocket League new season.',
    'Gaming setup upgrade complete.',
    'New monitor for competitive play.',
    'Keyboard switch preference?',
    'Mouse sensitivity settings.',
    'Headset recommendation for FPS.',
    'Desk setup tour.',
    '60+ posts for the seed. AceVerse is the place for gamers.',
    'One more for good measure. GG everyone!',
  ];
  const postIds: string[] = [];
  contents.forEach((content, i) => {
    const author = users[i % users.length];
    const game = games[i % games.length];
    const post = postsRepo.create({
      authorId: author.id,
      content,
      gameTag: i % 3 === 0 ? game.slug : null,
    });
    postIds.push(post.id);
  });
  return postIds;
}

function seedReplies(users: { id: string }[], postIds: string[]) {
  const firstPost = postIds[0];
  const r1 = repliesRepo.create({
    postId: firstPost,
    parentReplyId: null,
    authorId: users[1].id,
    content: 'Congrats! Huge achievement.',
  });
  const r2 = repliesRepo.create({
    postId: firstPost,
    parentReplyId: r1.id,
    authorId: users[2].id,
    content: 'Thanks! Took forever to get here.',
  });
  repliesRepo.create({
    postId: firstPost,
    parentReplyId: r2.id,
    authorId: users[0].id,
    content: 'Worth it though. Radiant lobby is different.',
  });
  const post = postsRepo.findById(firstPost);
  if (post && post.authorId !== users[1].id) {
    notificationsRepo.create({
      userId: post.authorId,
      type: 'REPLY',
      actorId: users[1].id,
      postId: firstPost,
      replyId: r1.id,
    });
  }
  for (let i = 0; i < 15; i++) {
    const postId = postIds[i % postIds.length];
    const post = postsRepo.findById(postId);
    if (!post) continue;
    const author = users[(i + 2) % users.length];
    if (author.id === post.authorId) continue;
    const reply = repliesRepo.create({
      postId,
      parentReplyId: null,
      authorId: author.id,
      content: `Reply ${i + 1} to a post. Great take!`,
    });
    notificationsRepo.create({
      userId: post.authorId,
      type: 'REPLY',
      actorId: author.id,
      postId,
      replyId: reply.id,
    });
  }
}

function seedSocial(users: { id: string }[], postIds: string[]) {
  users.forEach((u, i) => {
    const followIndex = (i + 1) % users.length;
    if (followIndex !== i) {
      try {
        followsRepo.create(u.id, users[followIndex].id);
        notificationsRepo.create({
          userId: users[followIndex].id,
          type: 'FOLLOW',
          actorId: u.id,
          postId: null,
          replyId: null,
        });
      } catch {
        // already following
      }
    }
  });
  postIds.slice(0, 40).forEach((postId, i) => {
    const post = postsRepo.findById(postId);
    if (!post) return;
    const liker = users[(i + 3) % users.length];
    if (liker.id === post.authorId) return;
    try {
      likesRepo.create(liker.id, postId);
      notificationsRepo.create({
        userId: post.authorId,
        type: 'LIKE',
        actorId: liker.id,
        postId,
        replyId: null,
      });
    } catch {
      // already liked
    }
  });
  postIds.slice(0, 15).forEach((postId, i) => {
    const post = postsRepo.findById(postId);
    if (!post) return;
    const reposter = users[(i + 5) % users.length];
    if (reposter.id === post.authorId) return;
    try {
      repostsRepo.create(reposter.id, postId);
      notificationsRepo.create({
        userId: post.authorId,
        type: 'REPOST',
        actorId: reposter.id,
        postId,
        replyId: null,
      });
    } catch {
      // already reposted
    }
  });
}

export async function runSeed() {
  resetDb();
  const games = seedGames();
  const users = await seedUsers();
  seedUserGames(users, games);
  const postIds = seedPosts(users, games);
  seedReplies(users, postIds);
  seedSocial(users, postIds);
  const { flushToDisk } = await import('./store.js');
  flushToDisk();
  return { users, games, postIds };
  console.log('Seed complete:', users.length, 'users,', games.length, 'games,', postIds.length, 'posts');
}

const isSeedEntry = process.argv[1]?.replace(/\\/g, '/').endsWith('seed.ts') || process.argv[1]?.replace(/\\/g, '/').endsWith('seed.js');
if (isSeedEntry) {
  runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
