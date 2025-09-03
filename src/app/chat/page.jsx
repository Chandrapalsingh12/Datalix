'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../lib/stores/authStore'
import { useChatStore } from '../../lib/stores/chatStore'
import RoomsList from '../../components/chat/RoomsList'
import ChatRoom from '../../components/chat/ChatRoom'

export default function ChatPage() {
  const { user, loading } = useAuthStore()
  const { fetchChatRooms, chatRooms, setCurrentRoom } = useChatStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchChatRooms()
    }
  }, [user])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Real-Time Chat</h1>
        <div className="text-sm text-gray-500">
          {chatRooms.length} room{chatRooms.length !== 1 ? 's' : ''} available
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <RoomsList />
        </div>
        <div className="lg:col-span-3">
          <ChatRoom />
        </div>
      </div>
    </div>
  )
}