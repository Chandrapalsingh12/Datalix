'use client'

import { Card, CardContent } from '../ui/card'
import { formatDate } from '../../lib/utils'

export default function PostCard({ post }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold">{post.profiles?.full_name || 'Anonymous'}</span>
              <span className="text-gray-500 text-sm">@{post.profiles?.username}</span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-400 text-sm">{formatDate(post.created_at)}</span>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            {post.image_url && (
              <img 
                src={post.image_url} 
                alt="Post image" 
                className="mt-3 rounded-lg max-w-full h-auto"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
