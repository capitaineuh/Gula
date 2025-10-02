/**
 * Service API pour communiquer avec le backend FastAPI
 */
import axios, { AxiosInstance, AxiosError } from 'axios'

// Configuration de l'URL de base de l'API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Création de l'instance Axios avec configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour gérer les erreurs globalement
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Gestion centralisée des erreurs
    if (error.response) {
      console.error('Erreur API:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('Pas de réponse du serveur:', error.request)
    } else {
      console.error('Erreur:', error.message)
    }
    return Promise.reject(error)
  }
)

/**
 * Types pour l'API
 */
export interface BiomarkerValue {
  name: string
  value: number
  unit?: string
}

export interface AnalyzeRequest {
  biomarkers: Record<string, number>
}

export interface BiomarkerResult {
  biomarker: string
  value: number
  unit: string
  status: string
  min_value: number
  max_value: number
  explanation: string
  advice: string
}

export interface AnalyzeResponse {
  status: string
  message: string
  results: BiomarkerResult[]
  summary: {
    normal: number
    bas: number
    haut: number
    inconnu?: number
  }
}

/**
 * Fonctions d'API
 */

// Vérifier la santé de l'API
export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await apiClient.get('/health')
  return response.data
}

// Analyser un bilan sanguin
export const analyzeBloodTest = async (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const response = await apiClient.post('/api/analyze', data)
  return response.data
}

// Récupérer la liste des biomarqueurs
export const getBiomarkers = async (): Promise<any> => {
  const response = await apiClient.get('/api/biomarkers')
  return response.data
}

export default apiClient

