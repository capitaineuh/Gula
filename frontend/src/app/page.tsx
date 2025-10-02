'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import UploadForm from '@/components/UploadForm'
import ResultsDashboard, { AnalysisResults } from '@/components/ResultsDashboard'
import SkeletonLoader from '@/components/SkeletonLoader'
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
        {/* En-tête avec animation */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🩺 Healer
          </h1>
          <p className="text-xl text-gray-600">
            Analysez et comprenez vos bilans sanguins
          </p>
        </motion.div>

        {/* Contenu principal avec transitions */}
        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <UploadForm onDataParsed={handleDataParsed} />
              
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-6"
                >
                  <SkeletonLoader />
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6"
                >
                  <p className="text-red-700">
                    <strong>Erreur :</strong> {error}
                  </p>
                </motion.div>
              )}

              {/* Section informative avec animation en cascade */}
              {!isAnalyzing && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: '📤', title: 'Import simple', text: 'Importez vos bilans au format CSV ou JSON en quelques clics' },
                    { icon: '📊', title: 'Visualisations claires', text: 'Tableaux et graphiques pour comprendre rapidement vos résultats' },
                    { icon: '💡', title: 'Explications détaillées', text: 'Conseils personnalisés et explications vulgarisées pour chaque biomarqueur' }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="bg-white rounded-lg shadow p-6 cursor-default"
                    >
                      <div className="text-3xl mb-3">{feature.icon}</div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-700">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
            >
              <ResultsDashboard results={results} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer avec animation */}
        <motion.div
          className="mt-12 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Healer MVP v1.0.0 - Plateforme éducative d'analyse de bilans sanguins</p>
        </motion.div>
      </div>
    </main>
  )
}

