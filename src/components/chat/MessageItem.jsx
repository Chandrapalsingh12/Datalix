'use client'

import { useAuthStore } from '../../lib/stores/authStore'
import { formatDate } from '../../lib/utils'

export default function MessageItem({ message }) {
  const { user } = useAuthStore()
  const isOwnMessage = user?.id === message.user_id

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div className={`p-3 rounded-lg ${
          isOwnMessage 
            ? 'bg-primary text-primary-foreground ml-2' 
            : 'bg-gray-100 text-gray-900 mr-2'
        }`}>
          {!isOwnMessage && (
            <div className="text-xs font-semibold mb-1 opacity-75">
              {message.profiles?.full_name || 'Anonymous'}
            </div>
          )}
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className={`text-xs mt-1 opacity-70 ${
            isOwnMessage ? 'text-right' : 'text-left'
          }`}>
            {formatDate(message.created_at)}
          </div>
        </div>
      </div>
      
      {!isOwnMessage && (
        <div className="order-1 mr-2 mt-1">
          {message.profiles?.avatar_url ? (
            <img
              src={message.profiles.avatar_url}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
              {message.profiles?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}