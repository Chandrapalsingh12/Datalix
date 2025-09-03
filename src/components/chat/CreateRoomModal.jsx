'use client'

import { useState } from 'react'
import { useChatStore } from '../../lib/stores/chatStore'
import { useAuthStore } from '../../lib/stores/authStore'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function CreateRoomModal({ isOpen, onClose }) {
  const [roomName, setRoomName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { createRoom } = useChatStore()
  const { user } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!roomName.trim() || !user) return

    setLoading(true)
    try {
      const { data, error } = await createRoom(roomName, description, user.id)
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          alert('A room with this name already exists. Please choose a different name.')
        } else {
          alert('Error creating room: ' + error.message)
        }
      } else {
        alert('Room created successfully!')
        setRoomName('')
        setDescription('')
        onClose()
      }
    } catch (error) {
      alert('Error creating room: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create New Room</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Room Name *</label>
                <Input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter room description (optional)"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !roomName.trim()}>
                  {loading ? 'Creating...' : 'Create Room'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}