import { supabase } from './supabase'

export const forceRefresh = async () => {
    console.log("refresh session start");
    
  try {

    await supabase.auth.refreshSession()
        console.log("refresh session start done");

    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.log("refresh session failed",error);
    console.error('Refresh failed:', error)
    return null
  }
}