import { create } from 'zustand'
import { supabase } from '../supabase'

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,
  uploading: false,

  fetchProfile: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data && !error) {
      set({ profile: data })
    }
    set({ loading: false })
    return { data, error }
  },

  updateProfile: async (userId, updates) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (data && !error) {
      set({ profile: data })
    }
    set({ loading: false })
    return { data, error }
  },

  uploadAvatar: async (userId, file) => {
    set({ uploading: true })
    
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      set({ profile: data, uploading: false })
      return { data, error: null }
    } catch (error) {
      set({ uploading: false })
      return { data: null, error }
    }
  },

  deleteAvatar: async (userId) => {
    set({ loading: true })
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId)
      .select()
      .single()

    if (data && !error) {
      set({ profile: data })
    }
    set({ loading: false })
    return { data, error }
  }
}))
