'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
} from 'chart.js'
import { Bar, Line, Doughnut, Scatter } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const chartComponents = {
  bar: Bar,
  line: Line,
  doughnut: Doughnut,
  scatter: Scatter
}

export default function ChartRenderer({ chart }) {
  const ChartComponent = chartComponents[chart.type]

  if (!ChartComponent) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Unsupported chart type: {chart.type}</p>
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chart.title
      },
    },
    scales: chart.type !== 'doughnut' ? {
      y: {
        beginAtZero: true
      }
    } : undefined
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="h-80">
        <ChartComponent data={chart.data} options={options} />
      </div>
    </div>
  )
}
