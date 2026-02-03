'use client'

import { useState, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ResultsDashboard, { AnalysisResults } from '@/components/ResultsDashboard'
import SkeletonLoader from '@/components/SkeletonLoader'
import UserMenu from '@/components/UserMenu'
import { analyzeBloodTest, analyzePDF } from '@/services/api'
import { parseCSV, parseJSON, validateParsedData, ParsedData } from '@/services/csvParser'

export default function Home() {
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setUploadProgress('')

    try {
      let analysisResults

      // Traitement selon le type de fichier
      if (file.name.endsWith('.pdf')) {
        // Gérer les PDFs avec l'API backend + Gemini
        setUploadProgress('📄 Envoi du PDF au serveur...')
        
        analysisResults = await analyzePDF(file)
        
        setUploadProgress('🤖 Extraction des données avec IA...')
        
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        // Parser CSV/JSON localement puis envoyer à l'API
        const text = await file.text()
        let parsedData: ParsedData

        if (file.name.endsWith('.csv')) {
          parsedData = parseCSV(text)
        } else {
          parsedData = parseJSON(text)
        }

        validateParsedData(parsedData)

        analysisResults = await analyzeBloodTest({
          biomarkers: parsedData.biomarkers
        })
        
      } else {
        throw new Error('Format de fichier non supporté. Utilisez PDF, CSV ou JSON.')
      }

      setResults(analysisResults)
      setUploadProgress('✅ Analyse terminée !')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse')
      console.error('Erreur d\'analyse:', err)
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setUploadProgress(''), 3000)
    }
  }

  const handleExampleData = async () => {
    setIsAnalyzing(true)
    setError('')

    try {
      const exampleData: ParsedData = {
        biomarkers: {
          hemoglobine: 12.0,
          cholesterol_total: 2.2,
          cholesterol_hdl: 0.35,
          cholesterol_ldl: 1.8,
          triglycerides: 1.8,
          vitamine_d: 22,
          vitamine_b12: 180,
          vitamine_b9: 2.5,
          vitamine_c: 3.0,
          glucose: 1.15,
          fer_serique: 55,
          ferritine: 20,
          calcium: 88,
          magnesium: 16,
          potassium: 3.2,
          creatinine: 14.0,
          uree: 0.48,
          leucocytes: 11.0,
          plaquettes: 380,
          tsh: 4.5,
          transaminases_alat: 48,
          transaminases_asat: 52,
          gamma_gt: 62,
          crp: 18
        }
      }

      const analysisResults = await analyzeBloodTest({
        biomarkers: exampleData.biomarkers
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
    setFile(null)
  }

  return (
    <AnimatePresence mode="wait">
      {!results ? (
        <motion.main
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
        >
          {/* Header */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <motion.h1 
                className="text-2xl font-bold text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Gula
              </motion.h1>
              <UserMenu />
            </div>
          </header>

          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Vulgarisation de vos<br />analyses sanguines
              </h2>
              <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                Obtenez des interprétations détaillées et personnalisées de vos résultats sanguins,
                avec des recommandations pour améliorer votre santé.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg inline-flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Choisir un fichier
                    </motion.div>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.csv,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </motion.div>

                <motion.button
                  onClick={handleExampleData}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-md border border-gray-200"
                >
                  Données d'exemple
                </motion.button>
              </div>

              {/* File selected */}
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-sm text-gray-600"
                >
                  <span className="font-semibold">{file.name}</span> sélectionné
                  <motion.button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    whileHover={{ scale: isAnalyzing ? 1 : 1.05 }}
                    whileTap={{ scale: isAnalyzing ? 1 : 0.95 }}
                    className="ml-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? 'Analyse en cours...' : 'Analyser maintenant'}
                  </motion.button>
                </motion.div>
              )}

              {/* Upload Progress */}
              {uploadProgress && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-sm text-emerald-600 font-medium"
                >
                  {uploadProgress}
                </motion.div>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-12"
                >
                  <SkeletonLoader />
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          </section>

          {/* Features Section */}
          {!isAnalyzing && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center mb-16"
              >
                <h3 className="text-4xl font-bold text-gray-900 mb-4">
                  Pourquoi Choisir Gula ?
                </h3>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Notre plateforme offre une analyse approfondie de vos analyses sanguines, vous aidant à comprendre votre santé et à prendre des décisions éclairées.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: (
                      <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ),
                    title: 'Téléversement Sécurisé',
                    description: 'Téléversez vos analyses en toute sécurité, avec une confidentialité garantie.'
                  },
                  {
                    icon: (
                      <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ),
                    title: 'Rapports Détaillés',
                    description: 'Recevez des rapports complets et faciles à comprendre, avec des graphiques et des explications claires.'
                  },
                  {
                    icon: (
                      <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    ),
                    title: 'Recommandations Personnalisées',
                    description: 'Bénéficiez de conseils personnalisés pour améliorer votre bien-être et atteindre vos objectifs de santé.'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-lg mb-4">
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="bg-gray-50 border-t border-gray-200 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Avertissement médical :</strong> Ces informations sont à but éducatif uniquement. 
                  Elles ne remplacent pas l'avis d'un professionnel de santé. Consultez toujours votre médecin 
                  pour l'interprétation de vos résultats et tout traitement.
                </p>
              </div>
              <p className="text-center text-sm text-gray-500">
                © 2025 Gula. Tous droits réservés.
              </p>
            </div>
          </footer>
        </motion.main>
      ) : (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4"
        >
          <div className="max-w-7xl mx-auto">
            <ResultsDashboard results={results} onReset={handleReset} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

