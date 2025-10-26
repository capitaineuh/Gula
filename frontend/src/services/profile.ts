/**
 * Service API pour la gestion du profil utilisateur
 */
import apiClient from './api';

/**
 * Types pour le profil utilisateur
 */
export interface ProfileData {
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

export interface ProfileResponse extends ProfileData {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export const getMyProfile = async (token: string): Promise<ProfileResponse> => {
  const response = await apiClient.get('/api/profile/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Créer ou remplacer complètement le profil
 */
export const createOrReplaceProfile = async (
  token: string,
  profileData: ProfileData
): Promise<ProfileResponse> => {
  const response = await apiClient.post('/api/profile/me', profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Mettre à jour partiellement le profil
 * Seuls les champs fournis seront mis à jour
 */
export const updateProfile = async (
  token: string,
  profileData: Partial<ProfileData>
): Promise<ProfileResponse> => {
  const response = await apiClient.put('/api/profile/me', profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Supprimer le profil de l'utilisateur
 */
export const deleteProfile = async (token: string): Promise<void> => {
  await apiClient.delete('/api/profile/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Helper pour obtenir le token depuis le localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Essayer de récupérer depuis localStorage
  const token = localStorage.getItem('access_token');
  if (token) return token;
  
  // Sinon, essayer depuis les données utilisateur
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.access_token || null;
    } catch {
      return null;
    }
  }
  
  return null;
};

