import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Providers OAuth désactivés (gérés par le backend)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const authOptions: NextAuthOptions = {
  providers: [
    // Authentification par email/mot de passe
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Appel à l'API FastAPI pour la connexion
          const formData = new URLSearchParams();
          formData.append("username", credentials.email);
          formData.append("password", credentials.password);

          const res = await fetch(`${API_URL}/auth/jwt/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          });

          if (!res.ok) {
            return null;
          }

          const data = await res.json();

          // Récupérer les informations de l'utilisateur
          const userRes = await fetch(`${API_URL}/auth/users/me`, {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          });

          if (!userRes.ok) {
            return null;
          }

          const user = await userRes.json();

          return {
            id: user.id.toString(),
            email: user.email,
            accessToken: data.access_token,
          };
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Première connexion
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
      }

      // OAuth côté NextAuth désactivé; géré via backend

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

