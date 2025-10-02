'use client'

import { motion } from 'framer-motion'

export default function SkeletonLoader() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* En-tête skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          
          {/* Barre de progression animée */}
          <div className="mt-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ width: '50%' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cartes skeleton avec animation en cascade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="space-y-3">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tableau skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="space-y-4">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Message d'analyse */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-blue-700 font-medium">
            Analyse en cours de vos biomarqueurs...
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}

