import { create } from 'zustand'
import { supabase } from '../supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await get().fetchProfile(session.user.id)
    }
    set({ user: session?.user || null, loading: false })

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await get().fetchProfile(session.user.id)
      } else {
        set({ profile: null })
      }
      set({ user: session?.user || null })
    })
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data && !error) {
      set({ profile: data })
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signUp: async (email, password, username, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (data.user && !error) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          full_name: fullName
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
      
    }

    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    set({ user: null, profile: null })
    return { error }
  }
}))
