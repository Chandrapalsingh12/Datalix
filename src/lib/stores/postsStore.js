import { create } from 'zustand'
import { supabase } from '../supabase'

export const usePostsStore = create((set, get) => ({
  posts: [],
  loading: false,

  fetchPosts: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (data && !error) {
      set({ posts: data, loading: false })
    }
  },

  createPost: async (content, userId, imageUrl = null) => {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        content,
        user_id: userId,
        image_url: imageUrl
      })
      .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (data && !error) {
      set(state => ({
        posts: [data, ...state.posts]
      }))
    }

    return { data, error }
  },

  subscribeToNewPosts: () => {
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'posts'
        }, 
        (payload) => {
          // Fetch the post with profile data
          supabase
            .from('posts')
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
            .then(({ data }) => {
              if (data) {
                set(state => ({
                  posts: [data, ...state.posts]
                }))
              }
            })
        }
      )
      .subscribe()

    return channel
  }
}))
