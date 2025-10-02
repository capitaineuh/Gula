/**
 * Configuration pour Chart.js
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

/**
 * Obtenir la couleur selon le statut
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'normal':
      return '#10b981' // Green
    case 'bas':
      return '#f59e0b' // Orange
    case 'haut':
      return '#ef4444' // Red
    default:
      return '#6b7280' // Gray
  }
}

/**
 * Obtenir le badge de statut
 */
export function getStatusBadge(status: string): { bg: string; text: string; label: string } {
  switch (status.toLowerCase()) {
    case 'normal':
      return { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Normal' }
    case 'bas':
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: '↓ Bas' }
    case 'haut':
      return { bg: 'bg-red-100', text: 'text-red-800', label: '↑ Haut' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: '? Inconnu' }
  }
}


