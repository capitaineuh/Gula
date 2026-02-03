# 🤖 testIHM – Agent IA de Tests Automatisés IHM

Système de tests IHM autonome utilisant une IA locale (Ollama) pour parser des scénarios de test en français et exécuter les actions via Playwright (piloté en MCP).

Ce dépôt peut être utilisé **comme repo Git indépendant** et appelé depuis n'importe quel autre projet (CI/CD ou local).

---

## 📋 Prérequis

1. **Node.js** v18+ (requis pour `fetch` natif)
2. **Ollama** installé et démarré (sur la machine qui lance les tests)
3. **Navigateurs Playwright** installés
4. Accès à l’application à tester (URL configurée dans ton scénario + `.env`)

---

## 🚀 Installation (dans un repo dédié)

Cloner ce projet dans un repo à part, ou comme sous-dossier d’un autre projet :

```bash
git clone <url-de-ce-repo> testIHM
cd testIHM

# Installer les dépendances
npm install

# Installer les navigateurs Playwright
npx playwright install
```

Configurer ensuite ton fichier `.env` (à créer à la racine de `testIHM`) en t’inspirant de l’exemple ci‑dessous.

---

## 🌍 Intégration depuis un autre projet / CI/CD

Depuis ton projet applicatif, tu peux par exemple :

- Ajouter ce dépôt comme **sous-dossier** (ou sous-module Git) `testIHM/`
- Dans ton pipeline CI/CD, ajouter une étape :

```bash
cd testIHM

# (optionnel) mettre à jour le code
git pull origin main

# Installer les dépendances (ou utiliser le cache CI)
npm install

# Démarrer le serveur MCP Playwright dans un job/terminal séparé
npm run dev &

# Lancer les tests sur un scénario spécifique
npm run test src/scenario.txt
```

Les résultats (screenshots + logs) seront générés dans `test-output/` à la racine du projet `testIHM`.

---

## 🤖 Configuration Ollama

### 1. Télécharger un modèle léger

Par exemple :

```bash
ollama pull mistral:latest
```

Tu peux aussi utiliser d’autres modèles (phi3, gemma2, qwen2, etc.).

### 2. Vérifier que Ollama fonctionne

```bash
ollama run mistral:latest "Bonjour"
```

### 3. Configurer le modèle via `.env`

Dans ton `.env` :

```env
OLLAMA_API=http://localhost:11434
OLLAMA_MODEL=mistral:latest
```

---

## 🎯 Utilisation locale

### Étape 1: Démarrer le serveur MCP Playwright

Dans un premier terminal :

```bash
cd testIHM
npm run dev
```

Le serveur MCP démarre (par défaut sur `http://localhost:3031`).

### Étape 2: Exécuter les tests

Dans un second terminal :

```bash
cd testIHM

# Utiliser le scénario par défaut
npm run test

# Ou spécifier un fichier de scénario
npm run test src/mon-scenario.txt
```

> Le dossier `test-output/` est vidé à chaque exécution puis regénéré.

---

## 📝 Format du scénario de test (`scenario.txt`)

Le scénario est un fichier texte simple, en français, où **chaque ligne** est une action avec un identifiant de pas (voir `GUIDE_SCENARIOS.md`).  
L’IA (Ollama) lit ce fichier, génère les appels MCP (start, open, click, fill, assertText, stop), puis l’orchestrateur les exécute.

### Variables d’environnement dans le scénario

Tu peux utiliser des **placeholders de variables d’environnement** dans ton `scenario.txt` : ils seront remplacés automatiquement avant l’envoi à l’IA.

Exemple dans `src/scenario.txt` :

```text
A.1: Ouvrir ${APP_URL}
A.2: Saisir "${LOGIN_EMAIL}" dans le champ "#email"
A.3: Saisir "${LOGIN_PASSWORD}" dans le champ "#password"
A.4: Cliquer sur "text=Se connecter"
```

Et dans ton `.env` :

```env
APP_URL=https://mon-app.exemple.com/login
LOGIN_EMAIL=user@test.com
LOGIN_PASSWORD=super-secret
```

> La syntaxe supportée est `${NOM_DE_VARIABLE}` (en majuscules, chiffres et `_`).  
> Si une variable n’est pas définie dans l’environnement, le placeholder `${...}` est laissé tel quel dans le texte.

---

## 🔧 Variables d’environnement principales

| Variable               | Défaut                  | Utilisation |
|------------------------|-------------------------|------------|
| `OLLAMA_API`          | `http://localhost:11434`| URL de l’API Ollama |
| `OLLAMA_MODEL`        | `mistral:latest`        | Modèle Ollama à utiliser |
| `MCP_ENDPOINT`        | `http://localhost:3031` | URL du serveur MCP Playwright |
| `PORT`                | `3031`                  | Port d’écoute du serveur MCP (`npm run dev`) |
| `HEADLESS`            | `true`                  | Mode headless du navigateur (`false` pour le voir) |
| `STEP_TIMEOUT_MS`     | `10000`                 | Durée max de retry par étape (ms) |
| `STEP_RETRY_INTERVAL_MS` | `500`               | Intervalle entre deux tentatives (ms) |
| `APP_URL`, `LOGIN_EMAIL`, `LOGIN_PASSWORD`, etc. | *(vide)* | Tes variables métier, injectées dans `scenario.txt` |

---

## 📊 Workflow global

```
scenario.txt (FR + ${VAR_ENV})
    ↓ (substitution .env)
Document de test enrichi
    ↓
Agent IA (Ollama)
    ↓
Liste d'appels MCP
    ↓
Serveur MCP Playwright
    ↓
Exécution des tests (avec retry et screenshots)
    ↓
test-output/ (logs + captures)
```

---

## 🛠️ Structure du projet

```text
testIHM/
├── src/
│   ├── server.ts          # Serveur MCP Playwright
│   ├── agent.ts           # Agent IA (Ollama)
│   ├── orchestrator.ts    # Orchestrateur principal (retry, screenshots, logs)
│   └── scenario.txt       # Scénario de test par défaut
├── test-output/           # Généré à chaque lancement (vidé avant chaque test)
│   ├── screenshots/
│   │   ├── success/       # Captures après chaque étape réussie (A.1.png, A.2.png...)
│   │   └── failed/        # Captures en cas d'erreur
│   └── test.log           # Logs complets du test
├── scripts/               # Scripts utilitaires
│   └── kill-port-3031.ps1 # Utilitaire pour libérer le port du serveur MCP
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🐛 Dépannage

### Le serveur MCP ne démarre pas

- Vérifier que le port n’est pas déjà utilisé : `netstat -ano | findstr 3031`
- Changer le port dans `.env` (`PORT=3032`) puis relancer `npm run dev`

### Ollama ne répond pas

- Vérifier qu’Ollama est démarré : `ollama list`
- Vérifier l’URL d’API : `curl http://localhost:11434/api/tags`

### Le modèle n’est pas trouvé

- Lister les modèles : `ollama list`
- Télécharger le modèle configuré dans `.env`

### Les tests échouent souvent / éléments non trouvés

- Activer le mode visible : `HEADLESS=false` dans `.env`, puis `npm run dev`
- Vérifier les sélecteurs dans ton scénario (`text=`, `#id`, `.class`, etc.)
- Ajuster `STEP_TIMEOUT_MS` pour laisser plus de temps à la page
- Consulter les captures et logs générés

---

## 📸 Captures d’écran et logs

Tous les résultats sont dans `./test-output/` (vidé et regénéré à chaque lancement) :

- **`test-output/screenshots/success/`** : captures automatiques après chaque étape réussie
- **`test-output/screenshots/failed/`** : capture en cas d’erreur sur une étape
- **`test-output/test.log`** : logs complets du test (utile pour le CI)

Les screenshots sont nommés selon l’identifiant du pas de test :

- `A.1.png`, `A.2.png`, etc.

> Tu n’as pas besoin d’ajouter "stop" ou "Prendre une capture" dans ton scénario : tout est géré automatiquement.

---

## 🔍 Logs du serveur MCP

Le serveur MCP (`npm run dev`) affiche des logs détaillés pour chaque action :

- 🌐 Lancement du navigateur
- 📄 Création de page
- → Actions (navigation, clics, remplissage)
- ✅ Succès / ❌ Erreurs

---

## 📚 Guides complémentaires

- `GUIDE_SCENARIOS.md` : format détaillé des lignes de scénario (`A.1: ...`, sélecteurs, bonnes pratiques).

---

## 🤝 Contribution

Pour améliorer le système :

1. Modifier `agent.ts` pour affiner le prompting et le parsing IA
2. Modifier `server.ts` pour ajouter de nouveaux outils MCP Playwright
3. Modifier `orchestrator.ts` pour ajuster la gestion des erreurs, des retries ou des screenshots
