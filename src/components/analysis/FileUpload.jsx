'use client'

import { useState, useRef } from 'react'
import { useAnalysisStore } from '../../lib/stores/analysisStore'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'

export default function FileUpload() {
  const [dragActive, setDragActive] = useState(false)
  const { uploading, uploadFile } = useAnalysisStore()
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only CSV and Excel files are allowed.'
    }

    if (file.size > 3 * 1024 * 1024) {
      return 'File size exceeds 3MB limit.'
    }

    return null
  }

  const handleFiles = async (files) => {
    if (files.length === 0) return

    const file = files[0]
    const validationError = validateFile(file)
    
    if (validationError) {
      alert(validationError)
      return
    }

    const result = await uploadFile(file)
    
    if (result.success) {
      alert('File uploaded and analyzed successfully!')
    } else {
      alert('Upload failed: ' + result.error)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <div className="space-y-4">
            <div className="text-4xl">📊</div>
            <div>
              <p className="text-lg font-medium">
                {dragActive ? 'Drop your file here' : 'Upload your data file'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports CSV and Excel files up to 3MB
              </p>
            </div>
            
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="outline"
            >
              {uploading ? 'Analyzing...' : 'Choose File'}
            </Button>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>• Supported formats: CSV (.csv), Excel (.xlsx, .xls)</p>
          <p>• Maximum file size: 3MB</p>
          <p>• We'll analyze your data and generate insights automatically</p>
        </div>
      </CardContent>
    </Card>
  )
}
