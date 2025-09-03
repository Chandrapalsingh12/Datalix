import { create } from 'zustand'
import { supabase } from '../supabase'

export const useAnalysisStore = create((set, get) => ({
  analyses: [],
  currentAnalysis: null,
  loading: false,
  uploading: false,

  fetchAnalyses: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data && !error) {
      set({ analyses: data })
    }
    set({ loading: false })
    return { data, error }
  },

  uploadFile: async (file) => {
    set({ uploading: true })
    
    try {
     const { data: { user } } = await supabase.auth.getUser()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', user.id)


      const response = await fetch('/api/analysis/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Add to analyses list
      set(state => ({
        analyses: [result.analysis, ...state.analyses],
        currentAnalysis: result.analysis,
        uploading: false
      }))

      return { success: true, data: result }
    } catch (error) {
      set({ uploading: false })
      return { success: false, error: error.message }
    }
  },

  setCurrentAnalysis: (analysis) => {
    set({ currentAnalysis: analysis })
  },

  deleteAnalysis: async (analysisId, userId) => {
    const { error } = await supabase
      .from('analysis')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', userId)

    if (!error) {
      set(state => ({
        analyses: state.analyses.filter(a => a.id !== analysisId),
        currentAnalysis: state.currentAnalysis?.id === analysisId ? null : state.currentAnalysis
      }))
    }

    return { error }
  }
}))
