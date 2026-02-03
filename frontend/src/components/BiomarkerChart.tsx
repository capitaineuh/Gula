'use client'

import { Bar } from 'react-chartjs-2'
import { getStatusColor } from '@/services/chartConfig'

interface BiomarkerResult {
  biomarker: string
  value: number
  unit: string
  status: string
  min_value: number
  max_value: number
  explanation: string
  advice: string
}

interface BiomarkerChartProps {
  result: BiomarkerResult
}

export default function BiomarkerChart({ result }: BiomarkerChartProps) {
  const data = {
    labels: ['Min', 'Votre valeur', 'Max'],
    datasets: [
      {
        label: result.biomarker,
        data: [result.min_value, result.value, result.max_value],
        backgroundColor: [
          '#93c5fd', // Blue for min
          getStatusColor(result.status), // Color based on status
          '#93c5fd', // Blue for max
        ],
        borderColor: [
          '#3b82f6',
          getStatusColor(result.status),
          '#3b82f6',
        ],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} ${result.unit}`
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + ' ' + result.unit
          }
        }
      },
    },
  }

  return (
    <div className="h-48 sm:h-56 md:h-64">
      <Bar data={data} options={options} />
    </div>
  )
}


