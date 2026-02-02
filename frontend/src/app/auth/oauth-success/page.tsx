"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// framer-motion retiré pour éviter erreurs d'insertion DOM

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const id = searchParams.get("id");
    const oauthProvider = searchParams.get("oauth_provider");

    if (token && email) {
      // Stocker le token et les informations utilisateur complètes dans localStorage
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify({ 
        email,
        id: id ? parseInt(id) : undefined,
        is_oauth: true,
        oauth_provider: oauthProvider || "google"
      }));
      
      // Déclencher l'événement de changement d'auth
      window.dispatchEvent(new Event("auth-change"));
      
      setStatus("success");
      setMessage("Connexion réussie !");
      
      // Rediriger vers l'accueil après 2 secondes
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else {
      setStatus("error");
      setMessage("Erreur lors de la connexion OAuth");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Connexion en cours...
              </h2>
              <p className="text-gray-600">
                Veuillez patienter pendant que nous vous connectons.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Connexion réussie !
              </h2>
              <p className="text-gray-600">
                Vous allez être redirigé vers l'accueil.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Erreur de connexion
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <button
                onClick={() => router.push("/auth/signin")}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Retour à la connexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
