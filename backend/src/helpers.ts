import { usersRepo } from './db/repos/users.js';
import { postsRepo } from './db/repos/posts.js';
import { likesRepo } from './db/repos/likes.js';
import { repostsRepo } from './db/repos/reposts.js';
import { followsRepo } from './db/repos/follows.js';
import { repliesRepo } from './db/repos/replies.js';
import { Post, User } from './db/types.js';

/** Normalize Express route param to string (Express typings can give string | string[]). */
export function paramStr(p: string | string[] | undefined): string {
  return Array.isArray(p) ? p[0] ?? '' : p ?? '';
}

export function shapePost(post: Post, viewerId?: string) {
  const author = usersRepo.findById(post.authorId);
  const likeCount = likesRepo.countByPost(post.id);
  const repostCount = repostsRepo.countByPost(post.id);
  const replyCount = repliesRepo.countByPost(post.id);
  const likedByMe = viewerId ? !!likesRepo.find(viewerId, post.id) : false;
  const repostedByMe = viewerId ? !!repostsRepo.find(viewerId, post.id) : false;
  const isFollowingAuthor = viewerId ? !!followsRepo.find(viewerId, post.authorId) : false;
  const canEdit = viewerId === post.authorId;
  const canDelete = viewerId === post.authorId;

  return {
    id: post.id,
    content: post.deletedAt ? null : post.content,
    gameTag: post.gameTag ?? null,
    deleted: !!post.deletedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: author
      ? { id: author.id, username: author.username, displayName: author.displayName, avatarUrl: author.avatarUrl }
      : null,
    likeCount,
    repostCount,
    replyCount,
    likedByMe,
    repostedByMe,
    isFollowingAuthor,
    canEdit,
    canDelete,
  };
}

export function shapeUser(user: User, viewerId?: string) {
  const followerCount = followsRepo.countFollowers(user.id);
  const followingCount = followsRepo.countFollowing(user.id);
  const isFollowing = viewerId ? !!followsRepo.find(viewerId, user.id) : false;
  const postCount = postsRepo.getByAuthor(user.id, undefined, 9999).length;

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    followerCount,
    followingCount,
    postCount,
    isFollowing,
    isMe: viewerId === user.id,
  };
}
