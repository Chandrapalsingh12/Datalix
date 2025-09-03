'use client'

import { useState } from 'react'
import { useChatStore } from '../../lib/stores/chatStore'
import { useAuthStore } from '../../lib/stores/authStore'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export default function MessageInput() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  
  const { currentRoom, sendMessage } = useChatStore()
  const { user } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || !currentRoom || !user) return

    setSending(true)
    try {
      await sendMessage(currentRoom.id, message, user.id)
      setMessage('')
    } catch (error) {
      alert('Error sending message: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1"
        disabled={sending}
      />
      <Button type="submit" disabled={sending || !message.trim()}>
        {sending ? 'Sending...' : 'Send'}
      </Button>
    </form>
  )
}
