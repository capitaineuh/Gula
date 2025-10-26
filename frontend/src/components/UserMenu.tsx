"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Fonction pour vérifier et charger l'utilisateur
    const checkUser = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          console.error("Erreur lors du parsing des données utilisateur:", e);
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    // Vérifier au chargement
    checkUser();

    // Écouter les événements de storage (changements dans d'autres onglets)
    window.addEventListener("storage", checkUser);

    // Créer un événement personnalisé pour les changements de connexion
    const handleAuthChange = () => {
      checkUser();
    };
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  // Recharger quand la route change (après redirection)
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Erreur lors du parsing des données utilisateur:", e);
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    // Déclencher l'événement de changement d'auth
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/profile">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-white border border-emerald-600 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors shadow-sm"
          >
            Mon profil
          </motion.button>
        </Link>
        <motion.button
          onClick={handleSignOut}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Déconnexion
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Link href="/auth/signin">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Connexion
        </motion.button>
      </Link>
    </motion.div>
  );
}

