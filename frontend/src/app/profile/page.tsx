"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyProfile, updateProfile, ProfileData as APIProfileData, getAuthToken } from "@/services/profile";

interface UserData {
  email: string;
  id?: number;
  is_oauth?: boolean;
  oauth_provider?: string;
}

interface ProfileData {
  // Informations de base
  birthdate?: string;
  biological_sex?: string;
  height?: number;
  weight?: number;
  ethnicity?: string;
  blood_type?: string;

  // Mode de vie
  alcohol_consumption?: string;
  tobacco_consumption?: string;
  diet_type?: string;
  medications?: string;
  supplements?: string;
  physical_activity_level?: string;

  // Contexte physiologique lors de la prise de sang
  is_menopause?: boolean;
  is_pregnant?: boolean;
  menstrual_cycle_phase?: string;
  blood_test_time?: string;
  blood_test_fasting?: boolean;

  // Contexte médical
  chronic_diseases?: string;
  family_history?: string;
  recent_infection?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    settings: boolean;
    analyses: boolean;
    account: boolean;
    basicInfo: boolean;
    lifestyle: boolean;
    physiological: boolean;
    medical: boolean;
  }>({
    settings: false,
    analyses: false,
    account: true,
    basicInfo: true,
    lifestyle: false,
    physiological: false,
    medical: false,
  });
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
    // Vérifier si l'utilisateur est connecté
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/signin");
      return;
    }
        
        const userData = JSON.parse(userStr);
        setUser(userData);

        // Récupérer le token
        const token = getAuthToken();
        if (!token) {
          console.error("Token non trouvé");
          setLoading(false);
          return;
        }

        // Charger le profil depuis l'API
        const profile = await getMyProfile(token);
        
        // Convertir la date si présente
        const profileWithFormattedDate = {
          ...profile,
          birthdate: profile.birthdate || undefined,
        };
        
        setProfileData(profileWithFormattedDate);
        setOriginalProfileData(profileWithFormattedDate);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        // Profil vide en cas d'erreur (sera créé lors de la première sauvegarde)
        setProfileData({});
        setOriginalProfileData({});
      } finally {
    setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleProfileChange = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Disparaît après 5 secondes
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = getAuthToken();
      if (!token) {
        showNotification('error', 'Vous devez être connecté pour sauvegarder');
        return;
      }

      // Enregistrer via l'API
      const updatedProfile = await updateProfile(token, profileData);
      
      // Mettre à jour les données locales
      setProfileData(updatedProfile);
      setOriginalProfileData(updatedProfile);
      setIsEditing(false);
      
      showNotification('success', 'Profil enregistré avec succès !');
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde du profil:", error);
      showNotification('error', 'Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Restaurer les données originales
    setProfileData(originalProfileData);
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Gula</h1>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors">
              Gula
            </h1>
          </Link>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Retour à l'accueil
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <div
              className={`rounded-lg shadow-lg p-4 ${
                notification.type === 'success'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <p className="font-medium">{notification.message}</p>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-auto hover:opacity-75"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Mon Profil</h2>

          {/* Paramètres du compte */}
          <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection("settings")}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Paramètres
              </h3>
              <motion.svg
                animate={{ rotate: expandedSections.settings ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {expandedSections.settings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 border-t border-gray-200">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-600 text-sm">
                        Fonctionnalité à venir : Modifier vos préférences et paramètres de compte
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mes analyses */}
          <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection("analyses")}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Mes analyses
              </h3>
              <motion.svg
                animate={{ rotate: expandedSections.analyses ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {expandedSections.analyses && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 border-t border-gray-200">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
                      <p className="text-gray-600">
                        Fonctionnalité à venir : Historique de vos analyses sanguines
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Informations du compte */}
          <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection("account")}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Informations du compte
            </h3>
              <motion.svg
                animate={{ rotate: expandedSections.account ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {expandedSections.account && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 border-t border-gray-200 space-y-6">
                    {/* Bouton d'édition */}
                    <div className="flex justify-end pt-2">
                      {!isEditing ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleToggleEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Modifier mes informations
                        </motion.button>
                      ) : (
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Annuler
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: saving ? 1 : 1.05 }}
                            whileTap={{ scale: saving ? 1 : 0.95 }}
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving ? (
                              <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Enregistrer
                              </>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Informations de connexion */}
                    <div className="space-y-4 pt-4">
              <div className="border-b border-gray-200 pb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Adresse email
                </label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>

              {user.is_oauth && (
                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Type de connexion
                  </label>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg text-gray-900 capitalize">
                      {user.oauth_provider || "OAuth"}
                    </p>
                  </div>
                </div>
              )}
                    </div>

                    {/* Section: Informations de base */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection("basicInfo")}
                        className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Informations de base
                        </h4>
                        <motion.svg
                          animate={{ rotate: expandedSections.basicInfo ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </button>
                      <AnimatePresence>
                        {expandedSections.basicInfo && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 space-y-4 bg-white">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Date de naissance
                                </label>
                                <input
                                  type="date"
                                  value={profileData.birthdate || ""}
                                  onChange={(e) => handleProfileChange("birthdate", e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Sexe biologique
                                </label>
                                <select
                                  value={profileData.biological_sex || ""}
                                  onChange={(e) => handleProfileChange("biological_sex", e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                  <option value="">Sélectionner...</option>
                                  <option value="male">Masculin</option>
                                  <option value="female">Féminin</option>
                                  <option value="other">Autre</option>
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Taille (cm)
                  </label>
                                  <input
                                    type="number"
                                    value={profileData.height || ""}
                                    onChange={(e) => handleProfileChange("height", parseFloat(e.target.value))}
                                    placeholder="170"
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                  />
                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Poids (kg)
                                  </label>
                                  <input
                                    type="number"
                                    value={profileData.weight || ""}
                                    onChange={(e) => handleProfileChange("weight", parseFloat(e.target.value))}
                                    placeholder="70"
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                  />
            </div>
          </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Origine ethnique
                                </label>
                                <select
                                  value={profileData.ethnicity || ""}
                                  onChange={(e) => handleProfileChange("ethnicity", e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                  <option value="">Sélectionner...</option>
                                  <option value="caucasian">Caucasien</option>
                                  <option value="african">Africain</option>
                                  <option value="asian">Asiatique</option>
                                  <option value="hispanic">Hispanique</option>
                                  <option value="middle_eastern">Moyen-Oriental</option>
                                  <option value="mixed">Mixte</option>
                                  <option value="other">Autre</option>
                                  <option value="prefer_not_say">Préfère ne pas répondre</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Groupe sanguin
                                </label>
                                <select
                                  value={profileData.blood_type || ""}
                                  onChange={(e) => handleProfileChange("blood_type", e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                  <option value="">Sélectionner...</option>
                                  <option value="A+">A+</option>
                                  <option value="A-">A-</option>
                                  <option value="B+">B+</option>
                                  <option value="B-">B-</option>
                                  <option value="AB+">AB+</option>
                                  <option value="AB-">AB-</option>
                                  <option value="O+">O+</option>
                                  <option value="O-">O-</option>
                                  <option value="unknown">Je ne sais pas</option>
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Section: Mode de vie */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection("lifestyle")}
                        className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Mode de vie
                        </h4>
                        <motion.svg
                          animate={{ rotate: expandedSections.lifestyle ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </button>
                      <AnimatePresence>
                        {expandedSections.lifestyle && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 space-y-4 bg-white">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Consommation d'alcool
                                </label>
                                <select
                                  value={profileData.alcohol_consumption || ""}
                                  onChange={(e) => handleProfileChange("alcohol_consumption", e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                  <option value="">Sélectionner...</option>
                                  <option value="none">Jamais</option>
                                  <option value="occasional">Occasionnelle (1-2 fois/mois)</option>
                                  <option value="moderate">Modérée (1-2 fois/semaine)</option>
                                  <option value="frequent">Fréquente (3-5 fois/semaine)</option>
                                  <option value="daily">Quotidienne</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Consommation de tabac
                                </label>
                                <select
                                  value={profileData.tobacco_consumption || ""}
                                  onChange={(e) => handleProfileChange("tobacco_consumption", e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                  <option value="">Sélectionner...</option>
                                  <option value="none">Non-fumeur</option>
                                  <option value="former">Ancien fumeur</option>
                                  <option value="light">Fumeur occasionnel (moins de 5/jour)</option>
                                  <option value="moderate">Fumeur modéré (5-15/jour)</option>
                                  <option value="heavy">Fumeur régulier (plus de 15/jour)</option>
                                  <option value="vaping">Vapoteur</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Niveau d'activité physique
                                </label>
                                <select
                                  value={profileData.physical_activity_level || ""}
                                  onChange={(e) => handleProfileChange("physical_activity_level", e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                  <option value="">Sélectionner...</option>
                                  <option value="sedentary">Sédentaire (peu ou pas d'exercice)</option>
                                  <option value="light">Léger (1-3 jours/semaine)</option>
                                  <option value="moderate">Modéré (3-5 jours/semaine)</option>
                                  <option value="active">Actif (6-7 jours/semaine)</option>
                                  <option value="very_active">Très actif (exercice intense quotidien)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Régime alimentaire particulier
                                </label>
                                <select
                                  value={profileData.diet_type || ""}
                                  onChange={(e) => handleProfileChange("diet_type", e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                  <option value="">Sélectionner...</option>
                                  <option value="none">Aucun régime particulier</option>
                                  <option value="vegetarian">Végétarien</option>
                                  <option value="vegan">Végétalien/Vegan</option>
                                  <option value="pescatarian">Pescatarien</option>
                                  <option value="keto">Cétogène/Keto</option>
                                  <option value="paleo">Paléo</option>
                                  <option value="mediterranean">Méditerranéen</option>
                                  <option value="low_carb">Faible en glucides</option>
                                  <option value="gluten_free">Sans gluten</option>
                                  <option value="lactose_free">Sans lactose</option>
                                  <option value="other">Autre</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Médicaments actuels
                                </label>
                                <textarea
                                  value={profileData.medications || ""}
                                  onChange={(e) => handleProfileChange("medications", e.target.value)}
                                  placeholder="Listez vos médicaments actuels (nom et dosage si possible)"
                                  rows={3}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Compléments alimentaires
                                </label>
                                <textarea
                                  value={profileData.supplements || ""}
                                  onChange={(e) => handleProfileChange("supplements", e.target.value)}
                                  placeholder="Listez vos compléments alimentaires (vitamines, minéraux, etc.)"
                                  rows={3}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Section: Contexte physiologique lors de la prise de sang */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection("physiological")}
                        className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
                          Contexte physiologique lors de la prise de sang
                        </h4>
                        <motion.svg
                          animate={{ rotate: expandedSections.physiological ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </button>
                      <AnimatePresence>
                        {expandedSections.physiological && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 space-y-4 bg-white">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id="is_pregnant"
                                  checked={profileData.is_pregnant || false}
                                  onChange={(e) => handleProfileChange("is_pregnant", e.target.checked)}
                                  disabled={!isEditing}
                                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:cursor-not-allowed"
                                />
                                <label htmlFor="is_pregnant" className="text-sm font-medium text-gray-700">
                                  Enceinte
                                </label>
                              </div>

                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id="is_menopause"
                                  checked={profileData.is_menopause || false}
                                  onChange={(e) => handleProfileChange("is_menopause", e.target.checked)}
                                  disabled={!isEditing}
                                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:cursor-not-allowed"
                                />
                                <label htmlFor="is_menopause" className="text-sm font-medium text-gray-700">
                                  Ménopause
                                </label>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Phase du cycle menstruel
                                </label>
                                <select
                                  value={profileData.menstrual_cycle_phase || ""}
                                  onChange={(e) => handleProfileChange("menstrual_cycle_phase", e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                  <option value="">Sélectionner...</option>
                                  <option value="menstruation">Menstruation (règles en cours)</option>
                                  <option value="follicular">Phase folliculaire (après règles)</option>
                                  <option value="ovulation">Ovulation</option>
                                  <option value="luteal">Phase lutéale (avant règles)</option>
                                  <option value="not_applicable">Non applicable</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Moment de la prise de sang
                                </label>
                                <select
                                  value={profileData.blood_test_time || ""}
                                  onChange={(e) => handleProfileChange("blood_test_time", e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                  <option value="">Sélectionner...</option>
                                  <option value="morning">Matin (6h-10h)</option>
                                  <option value="midday">Midi (10h-14h)</option>
                                  <option value="afternoon">Après-midi (14h-18h)</option>
                                  <option value="evening">Soir (18h-22h)</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id="blood_test_fasting"
                                  checked={profileData.blood_test_fasting || false}
                                  onChange={(e) => handleProfileChange("blood_test_fasting", e.target.checked)}
                                  disabled={!isEditing}
                                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:cursor-not-allowed"
                                />
                                <label htmlFor="blood_test_fasting" className="text-sm font-medium text-gray-700">
                                  Prise de sang à jeun
                                </label>
                              </div>
            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
          </div>

                    {/* Section: Contexte médical */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection("medical")}
                        className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
                          Contexte médical
                        </h4>
                        <motion.svg
                          animate={{ rotate: expandedSections.medical ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </button>
                      <AnimatePresence>
                        {expandedSections.medical && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 space-y-4 bg-white">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Maladies chroniques
                                </label>
                                <textarea
                                  value={profileData.chronic_diseases || ""}
                                  onChange={(e) => handleProfileChange("chronic_diseases", e.target.value)}
                                  placeholder="Diabète, hypertension, maladies auto-immunes, etc."
                                  rows={3}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Antécédents familiaux
                                </label>
                                <textarea
                                  value={profileData.family_history || ""}
                                  onChange={(e) => handleProfileChange("family_history", e.target.value)}
                                  placeholder="Maladies cardiaques, diabète, cancers, maladies métaboliques dans la famille..."
                                  rows={3}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Infection, inflammation ou fièvre récente
                                </label>
                                <textarea
                                  value={profileData.recent_infection || ""}
                                  onChange={(e) => handleProfileChange("recent_infection", e.target.value)}
                                  placeholder="Décrivez toute infection, inflammation ou épisode fébrile récent (dernières 2-4 semaines)"
                                  rows={3}
                                  disabled={!isEditing}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Gula. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

