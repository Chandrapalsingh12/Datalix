'use client'

import { useEffect, useRef } from 'react'
import { useChatStore } from '../../lib/stores/chatStore'
import { useAuthStore } from '../../lib/stores/authStore'
import MessageItem from './MessageItem'
import MessageInput from './MessageInput'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function ChatRoom() {
  const { messages, currentRoom, loading, cleanup } = useChatStore()
  const { user } = useAuthStore()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  if (!currentRoom) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Select a chat room to start messaging</p>
            <p className="text-sm text-gray-400">or create a new room to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isRoomOwner = currentRoom.created_by === user?.id

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              # {currentRoom.name}
              {isRoomOwner && (
                <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded-full font-normal">
                  Owner
                </span>
              )}
            </CardTitle>
            {currentRoom.description && (
              <p className="text-sm text-gray-500 mt-1">{currentRoom.description}</p>
            )}
            {currentRoom.profiles && (
              <p className="text-xs text-gray-400 mt-1">
                Created by {currentRoom.profiles.full_name || currentRoom.profiles.username}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col h-[60vh] p-0">
        <div className="flex-1 overflow-y-auto h-[200px] p-4 space-y-3">
          {loading ? (
            <div className="text-center py-4">Loading messages...</div>
          ) : (
            <>
              {messages.map(message => (
                <MessageItem key={message.id} message={message} />
              ))}
              {messages.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t p-4">
          <MessageInput />
        </div>
      </CardContent>
    </Card>
  )
}