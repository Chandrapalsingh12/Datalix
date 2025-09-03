'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../lib/stores/authStore'
import { useProfileStore } from '../../lib/stores/profileStore'
import ProfileForm from '../../components/profile/ProfileForm'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuthStore()
  const { fetchProfile } = useProfileStore()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchProfile(user.id)
    }
  }, [user])

  if (authLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-600">Manage your profile information and avatar</p>
      </div>
      <ProfileForm />
    </div>
  )
}