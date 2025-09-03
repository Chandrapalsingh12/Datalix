'use client'

import { useEffect, useState } from 'react'
import { useChatStore } from '../../lib/stores/chatStore'
import { useAuthStore } from '../../lib/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import CreateRoomModal from './CreateRoomModal'

export default function RoomsList() {
  const { chatRooms, currentRoom, fetchChatRooms, setCurrentRoom, deleteRoom, subscribeToRooms, roomsLoading } = useChatStore()
  const { user } = useAuthStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchChatRooms()
    
    // Subscribe to room changes
    const roomsSubscription = subscribeToRooms()
    
    return () => {
      if (roomsSubscription) {
        roomsSubscription.unsubscribe()
      }
    }
  }, [])

  const handleDeleteRoom = async (room) => {
    if (deleteConfirm === room.id) {
      const { error } = await deleteRoom(room.id, user.id)
      if (error) {
        alert('Error deleting room: ' + error.message)
      } else {
        alert('Room deleted successfully!')
      }
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(room.id)
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null)
      }, 3000)
    }
  }

  if (roomsLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">Loading rooms...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Chat Rooms</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="text-xs"
            >
              + New Room
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {chatRooms.map(room => (
              <div
                key={room.id}
                className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors ${
                  currentRoom?.id === room.id ? 'bg-primary/10 border-r-2 border-primary' : ''
                }`}
              >
                <button
                  onClick={() => setCurrentRoom(room)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="font-medium flex items-center">
                    # {room.name}
                    {room.created_by === user?.id && (
                      <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                  {room.description && (
                    <div className="text-sm text-gray-500 truncate">{room.description}</div>
                  )}
                  {room.profiles && (
                    <div className="text-xs text-gray-400 mt-1">
                      Created by {room.profiles.full_name || room.profiles.username}
                    </div>
                  )}
                </button>
                
                {room.created_by === user?.id && (
                  <Button
                    size="sm"
                    variant={deleteConfirm === room.id ? "destructive" : "ghost"}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteRoom(room)
                    }}
                    className="ml-2 text-xs"
                  >
                    {deleteConfirm === room.id ? 'Confirm' : '×'}
                  </Button>
                )}
              </div>
            ))}
            {chatRooms.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No rooms yet. Create the first one!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  )
}