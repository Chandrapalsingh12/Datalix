'use client'

import { useEffect } from 'react'
import { usePostsStore } from '../../lib/stores/postsStore'
import PostCard from './PostCard'

export default function PostsList() {
  const { posts, loading, fetchPosts, subscribeToNewPosts } = usePostsStore()

  useEffect(() => {
    fetchPosts()
    const subscription = subscribeToNewPosts()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>
  }

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      {posts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No posts yet. Be the first to post something!
        </div>
      )}
    </div>
  )
}
