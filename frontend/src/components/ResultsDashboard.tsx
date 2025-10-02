'use client'

import { useState, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStatusBadge } from '@/services/chartConfig'
import { downloadPDF } from '@/services/api'
import BiomarkerChart from './BiomarkerChart'

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

export interface AnalysisResults {
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

interface ResultsDashboardProps {
  results: AnalysisResults
  onReset: () => void
}

export default function ResultsDashboard({ results, onReset }: ResultsDashboardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [pdfError, setPdfError] = useState<string>('')

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const handleExportPDF = async () => {
    setIsExportingPDF(true)
    setPdfError('')
    
    try {
      await downloadPDF(results)
    } catch (error) {
      setPdfError('Erreur lors de l\'export PDF. Veuillez réessayer.')
      console.error('Erreur export PDF:', error)
    } finally {
      setIsExportingPDF(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec résumé */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              📊 Résultats de l'analyse
            </h2>
            <p className="text-gray-600 mt-1">{results.message}</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              {isExportingPDF ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Génération...
                </>
              ) : (
                <>
                  📄 Exporter PDF
                </>
              )}
            </motion.button>
            <motion.button
              onClick={onReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors shadow-sm hover:shadow-md"
            >
              Nouvelle analyse
            </motion.button>
          </div>
        </div>

        {/* Erreur PDF */}
        {pdfError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ⚠️ {pdfError}
          </div>
        )}

        {/* Résumé des statuts avec animation en cascade */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { value: results.results.length, label: 'Total analysés', color: 'blue', bg: 'bg-blue-50' },
            { value: results.summary.normal, label: 'Normaux', color: 'green', bg: 'bg-green-50' },
            { value: results.summary.bas, label: 'Bas', color: 'orange', bg: 'bg-orange-50' },
            { value: results.summary.haut, label: 'Élevés', color: 'red', bg: 'bg-red-50' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.5,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className={`${stat.bg} p-4 rounded-lg text-center cursor-default shadow-sm hover:shadow-md transition-shadow`}
            >
              <motion.div 
                className={`text-3xl font-bold text-${stat.color}-600`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tableau des résultats avec animation */}
      <motion.div 
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Biomarqueur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votre valeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plage normale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {results.results.map((result, index) => (
                <Fragment key={index}>
                  <tr className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{result.biomarker}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-semibold">{result.value}</span> {result.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {result.min_value} - {result.max_value} {result.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const badge = getStatusBadge(result.status)
                        return (
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleExpand(index)}
                        className="text-primary-600 hover:text-primary-900 font-medium flex items-center gap-1 transition-colors"
                      >
                        <motion.span
                          animate={{ rotate: expandedIndex === index ? 90 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="inline-block"
                        >
                          ►
                        </motion.span>
                        {expandedIndex === index ? 'Masquer' : 'Voir plus'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Panel de détails directement sous la ligne */}
                  <AnimatePresence mode="wait">
                    {expandedIndex === index && (
                      <motion.tr
                        key={`detail-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td colSpan={5} className="p-0 border-b border-gray-200">
                          <motion.div
                            initial={{ height: 0, y: -10 }}
                            animate={{ height: "auto", y: 0 }}
                            exit={{ height: 0, y: -10 }}
                            transition={{ 
                              duration: 0.4,
                              ease: "easeInOut"
                            }}
                            className="overflow-hidden bg-gray-50"
                          >
                            <div className="p-6">
                              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                {result.biomarker}
                              </h3>
                              
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Graphique */}
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1, duration: 0.3 }}
                                >
                                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                                    Visualisation comparative
                                  </h4>
                                  <BiomarkerChart result={result} />
                                </motion.div>

                                {/* Explications */}
                                <motion.div 
                                  className="space-y-4"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2, duration: 0.3 }}
                                >
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                      📖 Qu'est-ce que c'est ?
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {result.explanation}
                                    </p>
                                  </div>

                                  <div className={`p-4 rounded-lg ${
                                    result.status === 'normal' ? 'bg-green-50' :
                                    result.status === 'bas' ? 'bg-orange-50' : 'bg-red-50'
                                  }`}>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                      💡 Recommandation
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {result.advice}
                                    </p>
                                  </div>
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Avertissement médical */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>⚕️ Avertissement médical :</strong> Ces informations sont à but éducatif uniquement. 
              Elles ne remplacent pas l'avis d'un professionnel de santé. Consultez toujours votre médecin 
              pour l'interprétation de vos résultats et tout traitement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

