'use client'

import { useState } from 'react'
import ChartRenderer from './ChartRenderer'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { formatDate } from '../../lib/utils'

export default function AnalysisResults({ analysis }) {
  const [showRawData, setShowRawData] = useState(false)
  
  if (!analysis) {
    return (
      <div className="text-center py-8 text-gray-500">
        Upload a file to see analysis results
      </div>
    )
  }

  const { analysis_result, insights, file_name, created_at } = analysis
  const { summary, data } = analysis_result

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Analysis Results</span>
            <span className="text-sm font-normal text-gray-500">
              {formatDate(created_at)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{summary.totalRows}</div>
              <div className="text-sm text-gray-500">Rows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{summary.totalColumns}</div>
              <div className="text-sm text-gray-500">Columns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{summary.numericColumns.length}</div>
              <div className="text-sm text-gray-500">Numeric</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{summary.categoricalColumns.length}</div>
              <div className="text-sm text-gray-500">Categorical</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {summary.charts && summary.charts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Data Visualizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summary.charts.map((chart, index) => (
              <ChartRenderer key={index} chart={chart} />
            ))}
          </div>
        </div>
      )}

      {/* Raw Data Toggle */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Raw Data Preview</CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowRawData(!showRawData)}
            >
              {showRawData ? 'Hide Data' : 'Show Data'}
            </Button>
          </div>
        </CardHeader>
        {showRawData && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {data && data[0] && Object.keys(data[0]).map(header => (
                      <th key={header} className="border border-gray-200 px-4 py-2 text-left font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data && data.slice(0, 50).map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-200 px-4 py-2">
                          {value !== null && value !== undefined ? String(value) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data && data.length > 50 && (
                <div className="text-center py-4 text-gray-500">
                  ... and {data.length - 50} more rows
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
