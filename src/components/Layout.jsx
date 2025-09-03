'use client'

import { useAuthStore } from '../lib/stores/authStore'
import { Button } from './ui/button'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Layout({ children }) {
  const { user, profile, signOut } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (!user) {
    return children
  }

const navigation = [
  { name: 'Posts', href: '/posts' },
  { name: 'Chat', href: '/chat' },
  { name: 'Analysis', href: '/analysis' },
  { name: 'Profile', href: '/profile' }
]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-primary">
                Datalix
              </Link>
              
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm text-gray-600">
                  {profile?.full_name || user.email}
                </span>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}