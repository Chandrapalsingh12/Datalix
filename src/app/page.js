'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../lib/stores/authStore'

export default function Home() {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else {
        router.push('/posts')
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to ChatApp</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
