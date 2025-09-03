'use client'

import { useState, useRef } from 'react'
import { useProfileStore } from '../../lib/stores/profileStore'
import { useAuthStore } from '../../lib/stores/authStore'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function ProfileForm() {
  const { profile, loading, uploading, updateProfile, uploadAvatar, deleteAvatar } = useProfileStore()
  const { user } = useAuthStore()
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || ''
  })

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    const { error } = await updateProfile(user.id, formData)
    if (error) {
      alert('Error updating profile: ' + error.message)
    } else {
      alert('Profile updated successfully!')
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    const { error } = await uploadAvatar(user.id, file)
    if (error) {
      alert('Error uploading avatar: ' + error.message)
    } else {
      alert('Avatar updated successfully!')
    }
  }

  const handleDeleteAvatar = async () => {
    if (!user || !confirm('Are you sure you want to delete your avatar?')) return

    const { error } = await deleteAvatar(user.id)
    if (error) {
      alert('Error deleting avatar: ' + error.message)
    } else {
      alert('Avatar deleted successfully!')
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="text-white text-sm">Uploading...</div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="outline"
            >
              {uploading ? 'Uploading...' : 'Change Avatar'}
            </Button>
            {profile?.avatar_url && (
              <Button
                type="button"
                onClick={handleDeleteAvatar}
                disabled={loading}
                variant="destructive"
                size="sm"
              >
                Delete Avatar
              </Button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
