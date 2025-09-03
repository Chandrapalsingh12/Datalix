'use client'

import { useState } from 'react'
import { usePostsStore } from '../../lib/stores/postsStore'
import { useAuthStore } from '../../lib/stores/authStore'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'

export default function CreatePost() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { createPost } = usePostsStore()
  const { user } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      await createPost(content, user.id)
      setContent('')
    } catch (error) {
      alert('Error creating post: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="What's on your mind?"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
