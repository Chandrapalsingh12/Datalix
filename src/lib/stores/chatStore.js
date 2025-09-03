// src/lib/stores/chatStore.js
import { create } from 'zustand'
import { supabase } from '../supabase'

export const useChatStore = create((set, get) => ({
  messages: [],
  chatRooms: [],
  currentRoom: null,
  loading: false,
  channel: null,
  roomsLoading: false,

  fetchChatRooms: async () => {
    set({ roomsLoading: true })
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        profiles (
          username,
          full_name
        )
      `)
      .order('created_at', { ascending: true })

    if (data && !error) {
      set({ chatRooms: data })
    }
    set({ roomsLoading: false })
    return { data, error }
  },

  createRoom: async (name, description, userId) => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: userId
      })
      .select(`
        *,
        profiles (
          username,
          full_name
        )
      `)
      .single()

    if (data && !error) {
      set(state => ({
        chatRooms: [...state.chatRooms, data]
      }))
    }

    return { data, error }
  },

  deleteRoom: async (roomId, userId) => {
    // First check if user is the creator
    const room = get().chatRooms.find(r => r.id === roomId)
    if (room?.created_by !== userId) {
      return { data: null, error: { message: 'You can only delete rooms you created' } }
    }

    const { error } = await supabase
      .from('chat_rooms')
      .delete()
      .eq('id', roomId)
      .eq('created_by', userId) // Extra security check

    if (!error) {
      set(state => ({
        chatRooms: state.chatRooms.filter(room => room.id !== roomId),
        currentRoom: state.currentRoom?.id === roomId ? null : state.currentRoom,
        messages: state.currentRoom?.id === roomId ? [] : state.messages
      }))

      // If we deleted the current room, unsubscribe from its channel
      if (get().currentRoom?.id === roomId) {
        const { channel } = get()
        if (channel) {
          supabase.removeChannel(channel)
          set({ channel: null })
        }
      }
    }

    return { data: !error, error }
  },

  setCurrentRoom: (room) => {
    // Unsubscribe from previous channel
    const { channel } = get()
    if (channel) {
      supabase.removeChannel(channel)
    }

    set({ currentRoom: room, messages: [] })
    get().fetchMessages(room.id)
    get().subscribeToRoom(room.id)
  },

  fetchMessages: async (roomId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (data && !error) {
      set({ messages: data, loading: false })
    } else {
      set({ loading: false })
      console.error('Error fetching messages:', error)
    }
  },

  subscribeToRoom: (roomId) => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              profiles (
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            set(state => ({
              messages: [...state.messages, data]
            }))
          }
        }
      )
      .subscribe()

    set({ channel })
    return channel
  },

  subscribeToRooms: () => {
    const channel = supabase
      .channel('chat_rooms')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_rooms'
        },
        async (payload) => {
          const { data } = await supabase
            .from('chat_rooms')
            .select(`
              *,
              profiles (
                username,
                full_name
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            set(state => ({
              chatRooms: [...state.chatRooms, data]
            }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          const deletedId = payload.old.id
          set(state => ({
            chatRooms: state.chatRooms.filter(room => room.id !== deletedId),
            currentRoom: state.currentRoom?.id === deletedId ? null : state.currentRoom,
            messages: state.currentRoom?.id === deletedId ? [] : state.messages
          }))
        }
      )
      .subscribe()

    return channel
  },

  sendMessage: async (roomId, content, userId) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        content: content.trim()
      })
      .select()

    if (error) {
      console.error('Error sending message:', error)
    }

    return { data, error }
  },

  cleanup: () => {
    const { channel } = get()
    if (channel) {
      supabase.removeChannel(channel)
    }
    set({ channel: null, messages: [], currentRoom: null })
  }
}))
