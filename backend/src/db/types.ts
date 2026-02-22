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
