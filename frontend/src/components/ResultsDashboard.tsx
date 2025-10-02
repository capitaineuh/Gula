'use client'

import { useState } from 'react'
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
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center gap-2"
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
            </button>
            <button
              onClick={onReset}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Nouvelle analyse
            </button>
          </div>
        </div>

        {/* Erreur PDF */}
        {pdfError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ⚠️ {pdfError}
          </div>
        )}

        {/* Résumé des statuts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{results.results.length}</div>
            <div className="text-sm text-gray-600">Total analysés</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{results.summary.normal}</div>
            <div className="text-sm text-gray-600">Normaux</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-orange-600">{results.summary.bas}</div>
            <div className="text-sm text-gray-600">Bas</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-red-600">{results.summary.haut}</div>
            <div className="text-sm text-gray-600">Élevés</div>
          </div>
        </div>
      </div>

      {/* Tableau des résultats */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
            <tbody className="bg-white divide-y divide-gray-200">
              {results.results.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50">
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
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      {expandedIndex === index ? '▲ Masquer' : '▼ Voir plus'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Détails détaillés pour chaque biomarqueur */}
      {results.results.map((result, index) => (
        expandedIndex === index && (
          <div key={`detail-${index}`} className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {result.biomarker}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Graphique */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Visualisation comparative
                </h4>
                <BiomarkerChart result={result} />
              </div>

              {/* Explications */}
              <div className="space-y-4">
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
              </div>
            </div>
          </div>
        )
      ))}

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


