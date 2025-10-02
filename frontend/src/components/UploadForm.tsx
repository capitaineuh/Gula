'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { parseCSV, parseJSON, validateParsedData, ParsedData } from '@/services/csvParser'

interface UploadFormProps {
  onDataParsed: (data: ParsedData) => void;
}

export default function UploadForm({ onDataParsed }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

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

    try {
      const text = await file.text()
      let parsedData: ParsedData

      // Parser selon le type de fichier
      if (file.name.endsWith('.csv')) {
        parsedData = parseCSV(text)
      } else if (file.name.endsWith('.json')) {
        parsedData = parseJSON(text)
      } else {
        throw new Error('Format de fichier non supporté. Utilisez CSV ou JSON.')
      }

      // Valider les données
      validateParsedData(parsedData)

      // Envoyer les données au composant parent
      onDataParsed(parsedData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la lecture du fichier')
    } finally {
      setIsLoading(false)
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
        📤 Importer votre bilan sanguin
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="file-upload" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sélectionnez un fichier CSV ou JSON
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv,.json"
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ⚠️ {error}
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


