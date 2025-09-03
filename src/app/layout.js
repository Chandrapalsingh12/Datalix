'use client'

import { useEffect } from 'react'
import { useAuthStore } from '../lib/stores/authStore'
import Layout from '../components/Layout'
import './globals.css'

export default function RootLayout({ children }) {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <html lang="en">
    <head>
      <title>Datalix</title>
    </head>
      <body>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  )
}
