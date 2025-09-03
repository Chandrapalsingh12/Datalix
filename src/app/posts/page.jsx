'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../lib/stores/authStore'
import CreatePost from '../../components/posts/CreatePost'
import PostsList from '../../components/posts/PostsList'

export default function PostsPage() {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Posts</h1>
        <CreatePost />
      </div>
      <PostsList />
    </div>
  )
}
