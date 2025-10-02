'use client'

import { useState } from 'react'
import UploadForm from '@/components/UploadForm'
import ResultsDashboard, { AnalysisResults } from '@/components/ResultsDashboard'
import { analyzeBloodTest } from '@/services/api'
import { ParsedData } from '@/services/csvParser'

export default function Home() {
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string>('')

  const handleDataParsed = async (data: ParsedData) => {
    setIsAnalyzing(true)
    setError('')

    try {
      const analysisResults = await analyzeBloodTest({
        biomarkers: data.biomarkers
      })
      setResults(analysisResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse')
      console.error('Erreur d\'analyse:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setError('')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🩺 Healer
          </h1>
          <p className="text-xl text-gray-600">
            Analysez et comprenez vos bilans sanguins
          </p>
        </div>

        {/* Contenu principal */}
        {!results ? (
          <div className="max-w-3xl mx-auto">
            <UploadForm onDataParsed={handleDataParsed} />
            
            {isAnalyzing && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-blue-700 font-medium">
                  Analyse en cours...
                </p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-700">
                  <strong>Erreur :</strong> {error}
                </p>
              </div>
            )}

            {/* Section informative */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-3">📤</div>
                <h3 className="font-semibold text-lg mb-2 text-gray-700">
                  Import simple
                </h3>
                <p className="text-gray-600 text-sm">
                  Importez vos bilans au format CSV ou JSON en quelques clics
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-lg mb-2 text-gray-700">
                  Visualisations claires
                </h3>
                <p className="text-gray-600 text-sm">
                  Tableaux et graphiques pour comprendre rapidement vos résultats
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-3">💡</div>
                <h3 className="font-semibold text-lg mb-2 text-gray-700">
                  Explications détaillées
                </h3>
                <p className="text-gray-600 text-sm">
                  Conseils personnalisés et explications vulgarisées pour chaque biomarqueur
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ResultsDashboard results={results} onReset={handleReset} />
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Healer MVP v1.0.0 - Plateforme éducative d'analyse de bilans sanguins</p>
        </div>
      </div>
    </main>
  )
}

