import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// Configure API route for larger files
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper function to analyze data
function analyzeData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { insights: [], summary: {} }
  }

  const headers = Object.keys(data[0])
  const numericColumns = []
  const categoricalColumns = []

  // Identify column types
  headers.forEach(header => {
    const values = data.map(row => row[header]).filter(val => val !== null && val !== '')
    const numericValues = values.filter(val => !isNaN(parseFloat(val)))
    
    if (numericValues.length > values.length * 0.7) {
      numericColumns.push(header)
    } else {
      categoricalColumns.push(header)
    }
  })

  // Generate insights
  const insights = []
  const summary = {
    totalRows: data.length,
    totalColumns: headers.length,
    numericColumns,
    categoricalColumns,
    charts: []
  }

  // Chart 1: Summary statistics for numeric columns
  if (numericColumns.length > 0) {
    const statsData = numericColumns.slice(0, 5).map(col => {
      const values = data.map(row => parseFloat(row[col])).filter(val => !isNaN(val))
      const sum = values.reduce((a, b) => a + b, 0)
      const avg = sum / values.length
      const max = Math.max(...values)
      const min = Math.min(...values)
      
      return {
        column: col,
        average: Math.round(avg * 100) / 100,
        maximum: max,
        minimum: min,
        count: values.length
      }
    })

    summary.charts.push({
      type: 'bar',
      title: 'Column Statistics (Average Values)',
      data: {
        labels: statsData.map(d => d.column),
        datasets: [{
          label: 'Average',
          data: statsData.map(d => d.average),
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      }
    })

    insights.push(`Found ${numericColumns.length} numeric columns with measurable data`)
  }

  // Chart 2: Distribution of categorical data
  if (categoricalColumns.length > 0) {
    const firstCategorical = categoricalColumns[0]
    const distribution = {}
    data.forEach(row => {
      const value = row[firstCategorical]
      if (value) {
        distribution[value] = (distribution[value] || 0) + 1
      }
    })

    const topCategories = Object.entries(distribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)

    summary.charts.push({
      type: 'doughnut',
      title: `Distribution of ${firstCategorical}`,
      data: {
        labels: topCategories.map(([key]) => key),
        datasets: [{
          data: topCategories.map(([,value]) => value),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
            '#4BC0C0', '#FF6384'
          ]
        }]
      }
    })

    insights.push(`Most common ${firstCategorical}: ${topCategories[0][0]} (${topCategories[0][1]} occurrences)`)
  }

  // Chart 3: Trend analysis (if there's a date/time column)
  const dateColumns = headers.filter(h => 
    h.toLowerCase().includes('date') || 
    h.toLowerCase().includes('time') ||
    h.toLowerCase().includes('year')
  )

  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = dateColumns[0]
    const valueCol = numericColumns[0]
    
    const trendData = data
      .filter(row => row[dateCol] && row[valueCol])
      .map(row => ({
        x: row[dateCol],
        y: parseFloat(row[valueCol]) || 0
      }))
      .sort((a, b) => new Date(a.x) - new Date(b.x))
      .slice(0, 50) // Limit to 50 points for performance

    summary.charts.push({
      type: 'line',
      title: `${valueCol} over ${dateCol}`,
      data: {
        labels: trendData.map(d => d.x),
        datasets: [{
          label: valueCol,
          data: trendData.map(d => d.y),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }]
      }
    })

    insights.push(`Identified trend data for ${valueCol} over time`)
  }

  // Chart 4: Correlation heatmap data (simplified)
  if (numericColumns.length >= 2) {
    const correlationData = []
    for (let i = 0; i < Math.min(5, numericColumns.length); i++) {
      for (let j = 0; j < Math.min(5, numericColumns.length); j++) {
        if (i !== j) {
          const col1Values = data.map(row => parseFloat(row[numericColumns[i]])).filter(v => !isNaN(v))
          const col2Values = data.map(row => parseFloat(row[numericColumns[j]])).filter(v => !isNaN(v))
          
          // Simple correlation coefficient
          const correlation = calculateCorrelation(col1Values, col2Values)
          correlationData.push({
            x: numericColumns[i],
            y: numericColumns[j],
            value: correlation
          })
        }
      }
    }

    summary.charts.push({
      type: 'scatter',
      title: 'Column Relationships',
      data: {
        datasets: [{
          label: 'Correlation Strength',
          data: correlationData.map(d => ({ x: d.x, y: d.value })),
          backgroundColor: 'rgba(255, 99, 132, 0.6)'
        }]
      }
    })

    insights.push(`Analyzed relationships between ${numericColumns.length} numeric columns`)
  }

  return { insights, summary }
}

// Helper function for correlation calculation
function calculateCorrelation(x, y) {
  const n = Math.min(x.length, y.length)
  if (n < 2) return 0

  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0)
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0)
  const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  return denominator === 0 ? 0 : numerator / denominator
}

export async function POST(request) {
  try {
    
    const formData = await request.formData()
    const user_id = formData.get('user_id')
    const file = formData.get('file')


    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only CSV and Excel files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (3MB limit)
    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 3MB limit' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let parsedData = []

    try {
      if (file.type === 'text/csv') {
        // Parse CSV
        const csvText = buffer.toString('utf-8')
        const parseResult = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        })
        parsedData = parseResult.data
      } else {
        // Parse Excel
        const workbook = XLSX.read(buffer)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        parsedData = XLSX.utils.sheet_to_json(worksheet)
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Failed to parse file: ' + parseError.message },
        { status: 400 }
      )
    }

    if (parsedData.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      )
    }

    // Analyze the data
    const { insights, summary } = analyzeData(parsedData)

    // Store analysis in database
    const { data: analysisResult, error: dbError } = await supabase
      .from('analysis')
      .insert({
        user_id: user_id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        analysis_result: {
          data: parsedData.slice(0, 1000), // Store first 1000 rows
          summary
        },
        insights
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to save analysis: ' + dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      summary,
      insights,
      dataPreview: parsedData.slice(0, 100) // Return first 100 rows for preview
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}
