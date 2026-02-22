import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { format } from 'date-fns'
import { useToast } from '../hooks/useToast'
import PostCard from '../components/PostCard'
import PostCardSkeleton from '../components/PostCardSkeleton'
import type { TimelinePost } from '../components/Feed'
import { Trophy, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [activeTab, setActiveTab] = useState<'posts' | 'clips' | 'likes'>('posts')
  const [bioExpanded, setBioExpanded] = useState(false)
  const BIO_TRUNCATE_LENGTH = 160

  const { data: profileData } = useQuery({
    queryKey: ['users', username],
    queryFn: () => api.users.getProfile(username!),
    enabled: !!username,
  })
  const { data: gamesData } = useQuery({
    queryKey: ['users', username, 'games'],
    queryFn: () => api.users.getGames(username!),
    enabled: !!username,
  })

  const user = profileData?.user
  const userGames = gamesData?.userGames ?? []

  const followMutation = useMutation({
    mutationFn: (un: string) => api.users.follow(un),
    onMutate: async (un) => {
      if (un !== username) return
      await queryClient.cancelQueries({ queryKey: ['users', username] })
      const prev = queryClient.getQueryData<{ user: any }>(['users', username])
      if (prev?.user) {
        queryClient.setQueryData(['users', username], {
          user: {
            ...prev.user,
            isFollowing: true,
            followerCount: (prev.user.followerCount ?? 0) + 1,
          },
        })
      }
      return { prev }
    },
    onError: (_err, _un, context) => {
      if (context?.prev) queryClient.setQueryData(['users', username], context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['timeline', 'home'] })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: (un: string) => api.users.unfollow(un),
    onMutate: async (un) => {
      if (un !== username) return
      await queryClient.cancelQueries({ queryKey: ['users', username] })
      const prev = queryClient.getQueryData<{ user: any }>(['users', username])
      if (prev?.user) {
        queryClient.setQueryData(['users', username], {
          user: {
            ...prev.user,
            isFollowing: false,
            followerCount: Math.max(0, (prev.user.followerCount ?? 0) - 1),
          },
        })
      }
      return { prev }
    },
    onError: (_err, _un, context) => {
      if (context?.prev) queryClient.setQueryData(['users', username], context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['timeline', 'home'] })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: { displayName?: string; bio?: string; avatarUrl?: string }) =>
      api.users.updateProfile(username!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', username] })
      setEditOpen(false)
      showToast('Profile updated', 'success')
    },
    onError: (err: Error & { message?: string }) => {
      showToast(err?.message ?? 'Failed to update profile', 'error')
    },
  })

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
  } = useInfiniteQuery({
    queryKey: ['users', username, 'posts'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      api.users.getPosts(username!, pageParam),
    getNextPageParam: (last: { nextCursor: string | null }) => last.nextCursor ?? undefined,
    enabled: !!username,
  })

  const profilePosts = postsData?.pages.flatMap((p: { posts: TimelinePost[] }) => p.posts) ?? []

  const updateProfilePostsCache = useCallback(
    (postId: string, updater: (p: TimelinePost) => TimelinePost) => {
      queryClient.setQueryData(
        ['users', username, 'posts'],
        (old: { pages: { posts: TimelinePost[]; nextCursor: string | null }[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) => (p.id === postId ? updater(p) : p)),
            })),
          }
        }
      )
    },
    [queryClient, username]
  )

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.posts.like(postId),
    onMutate: (postId) => {
      updateProfilePostsCache(postId, (p) => ({ ...p, likedByMe: true, likeCount: p.likeCount + 1 }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', username, 'posts'] })
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })
  const unlikeMutation = useMutation({
    mutationFn: (postId: string) => api.posts.unlike(postId),
    onMutate: (postId) => {
      updateProfilePostsCache(postId, (p) => ({
        ...p,
        likedByMe: false,
        likeCount: Math.max(0, p.likeCount - 1),
      }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', username, 'posts'] })
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })
  const repostMutation = useMutation({
    mutationFn: (postId: string) => api.posts.repost(postId),
    onMutate: (postId) => {
      updateProfilePostsCache(postId, (p) => ({ ...p, repostedByMe: true, repostCount: p.repostCount + 1 }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', username, 'posts'] })
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })
  const unrepostMutation = useMutation({
    mutationFn: (postId: string) => api.posts.unrepost(postId),
    onMutate: (postId) => {
      updateProfilePostsCache(postId, (p) => ({
        ...p,
        repostedByMe: false,
        repostCount: Math.max(0, p.repostCount - 1),
      }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', username, 'posts'] })
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })

  const handleEditPost = useCallback(
    async (postId: string, content: string) => {
      const { post } = await api.posts.update(postId, { content })
      queryClient.setQueryData(
        ['users', username, 'posts'],
        (old: { pages: { posts: TimelinePost[]; nextCursor: string | null }[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) => (p.id === postId ? post : p)),
            })),
          }
        }
      )
    },
    [queryClient, username]
  )

  const handleDeletePost = useCallback(
    async (postId: string) => {
      await api.posts.delete(postId)
      queryClient.setQueryData(
        ['users', username, 'posts'],
        (old: { pages: { posts: TimelinePost[]; nextCursor: string | null }[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? { ...p, content: null, deleted: true, canEdit: false, canDelete: false }
                  : p
              ),
            })),
          }
        }
      )
      showToast('Post deleted', 'success')
    },
    [queryClient, username, showToast]
  )

  const openEdit = () => {
    setEditDisplayName(user?.displayName ?? '')
    setEditBio(user?.bio ?? '')
    setEditAvatarUrl(user?.avatarUrl ?? '')
    setEditOpen(true)
  }

  const submitEdit = () => {
    updateProfileMutation.mutate({
      displayName: editDisplayName.trim() || undefined,
      bio: editBio.trim() || undefined,
      avatarUrl: editAvatarUrl.trim() || undefined,
    })
  }

  if (!username) {
    return (
      <div className="p-4 text-secondary">Invalid profile.</div>
    )
  }
  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="h-32 md:h-40 w-full bg-secondary animate-pulse" />
        <div className="px-4 -mt-16 md:-mt-20 relative z-10 pb-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-tertiary animate-pulse shrink-0" />
            <div className="flex-1 space-y-2 mt-2">
              <div className="h-6 w-48 bg-tertiary rounded animate-pulse" />
              <div className="h-4 w-32 bg-tertiary rounded animate-pulse" />
              <div className="h-4 w-24 bg-tertiary rounded animate-pulse" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const joinDate = user.createdAt ? format(new Date(user.createdAt), 'MMM d') : ''
  const isMe = user.isMe === true

  return (
    <div className="min-h-screen">
      {/* Cover area */}
      <div className="h-40 md:h-52 w-full bg-gradient-to-b from-secondary to-primary" />
      <div className="px-4 -mt-16 md:-mt-20 relative z-10 pb-4">
        <div className="flex flex-col md:flex-row md:items-end md:gap-6">
          <img
            src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + username}
            alt=""
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary object-cover shrink-0"
          />
          <div className="mt-3 md:mt-0 flex-1 min-w-0">
            <h1 className="text-page-title md:text-page-title-lg text-primary truncate">
              {user.displayName || username}
            </h1>
            <p className="text-secondary">@{user.username}</p>
            {joinDate && (
              <p className="text-sm text-tertiary mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Joined {joinDate}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-secondary">
              <span><strong className="text-primary">{profilePosts.length}</strong> Posts</span>
              <span><strong className="text-primary">{user.followerCount ?? 0}</strong> Followers</span>
              <span><strong className="text-primary">{user.followingCount ?? 0}</strong> Following</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {isMe ? (
                <button
                  type="button"
                  onClick={openEdit}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-accent text-white"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  {user.isFollowing ? (
                    <motion.button
                      type="button"
                      onClick={() => unfollowMutation.mutate(username)}
                      disabled={unfollowMutation.isPending}
                      className="px-4 py-2 rounded-full text-sm font-medium border border-border-default text-secondary hover:bg-hover transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 min-w-[100px]"
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {unfollowMutation.isPending ? (
                        <span className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      ) : null}
                      {unfollowMutation.isPending ? '' : 'Unfollow'}
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={() => followMutation.mutate(username)}
                      disabled={followMutation.isPending}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 min-w-[100px] bg-accent text-white hover:bg-accent-hover"
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {followMutation.isPending ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : null}
                      {followMutation.isPending ? '' : 'Follow'}
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {user.bio && (
          <div className="mt-4">
            <p className="text-primary whitespace-pre-wrap text-body leading-content">
              {bioExpanded || user.bio.length <= BIO_TRUNCATE_LENGTH
                ? user.bio
                : user.bio.slice(0, BIO_TRUNCATE_LENGTH)}
            </p>
            {user.bio.length > BIO_TRUNCATE_LENGTH && (
              <button
                type="button"
                onClick={() => setBioExpanded((e) => !e)}
                className="mt-1 text-accent hover:underline text-sm"
              >
                {bioExpanded ? 'Show less' : '...more'}
              </button>
            )}
          </div>
        )}

        {/* Gaming Ranks section */}
        {userGames.length > 0 && (
          <section className="mt-6">
            <h2 className="text-section text-secondary uppercase tracking-wider mb-3">
              Gaming Ranks
            </h2>
            <ul className="space-y-3">
              {userGames.map((ug: {
                id: string
                rank: string
                rankTier: string
                updatedAt: string
                game: { id: string; name: string; slug: string; iconUrl?: string; color?: string } | null
              }) => (
                <li
                  key={ug.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border-default"
                >
                  <span
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${ug.game?.color || 'var(--color-accent)'}30`, color: ug.game?.color || 'var(--color-accent)' }}
                    title={ug.rank}
                  >
                    {ug.game?.iconUrl ? (
                      <img src={ug.game.iconUrl} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <Trophy className="w-5 h-5" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary">{ug.game?.name ?? 'Game'}</p>
                    <p className="text-sm text-accent">{ug.rank}</p>
                    <p className="text-xs text-tertiary mt-0.5">
                      Updated {format(new Date(ug.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs font-semibold shrink-0"
                    style={{ backgroundColor: `${ug.game?.color || 'var(--color-accent)'}40`, color: ug.game?.color || 'var(--color-accent)' }}
                  >
                    {ug.rankTier}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Content tabs */}
        <section className="mt-6 border-t border-border-default">
          <div className="flex border-b border-border-default">
            {(['posts', 'clips', 'likes'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? 'text-accent'
                    : 'text-secondary hover:text-primary hover:bg-hover'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>
          
          {activeTab === 'posts' && (
            postsLoading ? (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            ) : profilePosts.length === 0 ? (
              <p className="text-tertiary py-6 text-center">No posts yet.</p>
            ) : (
              <div className="space-y-0">
                {profilePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={() =>
                      post.likedByMe
                        ? unlikeMutation.mutate(post.id)
                        : likeMutation.mutate(post.id)
                    }
                    onRepost={() =>
                      post.repostedByMe
                        ? unrepostMutation.mutate(post.id)
                        : repostMutation.mutate(post.id)
                    }
                    onReply={() => navigate(`/p/${post.id}`)}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                ))}
                {hasNextPage && (
                  <div className="p-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-4 py-2 rounded-full text-sm border border-border-default text-secondary hover:bg-hover disabled:opacity-50"
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {activeTab === 'clips' && (
            <div className="py-12 text-center">
              <p className="text-secondary">Clips coming soon</p>
              <p className="text-tertiary text-sm mt-1">Video clips will appear here</p>
            </div>
          )}
          
          {activeTab === 'likes' && (
            <div className="py-12 text-center">
              <p className="text-secondary">Likes coming soon</p>
              <p className="text-tertiary text-sm mt-1">Liked posts will appear here</p>
            </div>
          )}
        </section>
      </div>

      {/* Edit Profile modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setEditOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Edit profile"
        >
          <div
            className="bg-secondary rounded-xl border border-border-default w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-section-lg text-primary mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-secondary-size font-medium text-secondary mb-1">Display name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 rounded-lg bg-tertiary border border-border-default text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Display name"
                />
              </div>
              <div>
                <label className="block text-secondary-size font-medium text-secondary mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-tertiary border border-border-default text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  placeholder="Bio"
                />
              </div>
              <div>
                <label className="block text-secondary-size font-medium text-secondary mb-1">Avatar URL</label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-tertiary border border-border-default text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded-full text-sm font-medium text-secondary hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitEdit}
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 transition-colors bg-accent text-white"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
