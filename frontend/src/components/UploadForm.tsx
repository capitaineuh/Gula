'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { parseCSV, parseJSON, validateParsedData, ParsedData } from '@/services/csvParser'
import { analyzePDF } from '@/services/api'

interface UploadFormProps {
  onDataParsed: (data: ParsedData) => void;
}

export default function UploadForm({ onDataParsed }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setIsLoading(true)
    setError('')
    setUploadProgress('')

    try {
      let parsedData: ParsedData

      // Traitement selon le type de fichier
      if (file.name.endsWith('.pdf')) {
        // Gérer les PDFs avec l'API backend + Gemini
        setUploadProgress('Envoi du PDF au serveur...')
        
        const response = await analyzePDF(file)
        
        setUploadProgress('Extraction des données avec IA...')
        
        // Convertir la réponse de l'API en format ParsedData
        // L'API retourne déjà les résultats analysés, on les affiche directement
        parsedData = {
          biomarkers: response.results.reduce((acc, result) => {
            // Utiliser le nom interne du biomarqueur (converti en minuscules)
            const biomarkerKey = result.biomarker.toLowerCase().replace(/\s+/g, '_')
            acc[biomarkerKey] = result.value
            return acc
          }, {} as Record<string, number>)
        }
        
      } else if (file.name.endsWith('.csv')) {
        // Parser les CSV localement
        const text = await file.text()
        parsedData = parseCSV(text)
        
      } else if (file.name.endsWith('.json')) {
        // Parser les JSON localement
        const text = await file.text()
        parsedData = parseJSON(text)
        
      } else {
        throw new Error('Format de fichier non supporté. Utilisez PDF, CSV ou JSON.')
      }

      // Valider les données
      validateParsedData(parsedData)

      // Envoyer les données au composant parent
      onDataParsed(parsedData)
      
      setUploadProgress('Analyse terminée !')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la lecture du fichier')
    } finally {
      setIsLoading(false)
      setTimeout(() => setUploadProgress(''), 3000)
    }
  }

  const handleExampleData = () => {
    const exampleData: ParsedData = {
      biomarkers: {
        hemoglobine: 13.2,
        cholesterol_total: 2.3,
        vitamine_d: 18,
        glucose: 0.95,
        fer_serique: 85
      }
    }
    onDataParsed(exampleData)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Importer votre bilan sanguin
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="file-upload" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sélectionnez un fichier PDF, CSV ou JSON
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.csv,.json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100
              cursor-pointer"
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            Fichier sélectionné : <span className="font-semibold">{file.name}</span>
          </div>
        )}

        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {uploadProgress}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <motion.button
            type="submit"
            disabled={!file || isLoading}
            whileHover={{ scale: !file || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: !file || isLoading ? 1 : 0.98 }}
            className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 
              text-white font-semibold py-3 px-6 rounded transition-colors shadow-sm hover:shadow-md"
          >
            {isLoading ? 'Analyse en cours...' : 'Analyser'}
          </motion.button>
          
          <motion.button
            type="button"
            onClick={handleExampleData}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-secondary-500 hover:bg-secondary-600 
              text-white font-semibold py-3 px-6 rounded transition-colors shadow-sm hover:shadow-md"
          >
            Utiliser des données d'exemple
          </motion.button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <p className="text-sm text-gray-700 mb-3">
          <strong>✨ Nouveau : Analysez directement vos PDFs de bilans sanguins !</strong>
        </p>
        <p className="text-xs text-gray-600 mb-4">
          Notre IA extrait automatiquement les biomarqueurs de votre document.
        </p>
        
        <p className="text-sm text-gray-700">
          <strong>Format CSV attendu :</strong>
        </p>
        <pre className="text-xs mt-2 bg-white p-2 rounded">
{`biomarqueur,valeur
hemoglobine,13.2
cholesterol_total,2.3
vitamine_d,18`}
        </pre>
        
        <p className="text-sm text-gray-700 mt-3">
          <strong>Format JSON attendu :</strong>
        </p>
        <pre className="text-xs mt-2 bg-white p-2 rounded">
{`{
  "hemoglobine": 13.2,
  "cholesterol_total": 2.3,
  "vitamine_d": 18
}`}
        </pre>
      </div>
    </div>
  )
}


