'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../lib/stores/authStore'
import { useAnalysisStore } from '../../lib/stores/analysisStore'
import FileUpload from '../../components/analysis/FileUpload'
import AnalysisResults from '../../components/analysis/AnalysisResults'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function AnalysisPage() {
  const { user, loading: authLoading } = useAuthStore()
  const { 
    analyses, 
    currentAnalysis, 
    loading, 
    fetchAnalyses, 
    setCurrentAnalysis,
    deleteAnalysis 
  } = useAnalysisStore()
  const router = useRouter()
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAnalyses(user.id)
    }
  }, [user])

  const handleDeleteAnalysis = async (analysisId) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      const { error } = await deleteAnalysis(analysisId, user.id)
      if (error) {
        alert('Error deleting analysis: ' + error.message)
      }
    }
  }

  if (authLoading || loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Data Analysis</h1>
        <p className="text-gray-600">Upload your CSV or Excel files to generate insights and visualizations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-4">
          <FileUpload />
          
          {/* Analysis History */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">History</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? '−' : '+'}
                </Button>
              </div>
            </CardHeader>
            {showHistory && (
              <CardContent className="space-y-2">
                {analyses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No analyses yet</p>
                ) : (
                  analyses.map(analysis => (
                    <div
                      key={analysis.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentAnalysis?.id === analysis.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className="flex-1"
                        onClick={() => setCurrentAnalysis(analysis)}
                      >
                        <div className="font-medium text-sm truncate">
                          {analysis.file_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAnalysis(analysis.id)
                        }}
                        className="mt-2 text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-3">
          <AnalysisResults analysis={currentAnalysis} />
        </div>
      </div>
    </div>
  )
}
