/**
 * Agent IA qui utilise Ollama pour parser un document de test
 * et générer les appels MCP correspondants
 */

import fs from 'fs';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env
dotenv.config();

const OLLAMA_API = process.env.OLLAMA_API || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'mistral:latest'; //'llama3.2:1b'; // Modèle léger par défaut

export interface MCPCall {
  name: string;
  arguments: Record<string, any>;
  stepId?: string; // Identifiant du pas de test (ex: "A.1")
}

/**
 * Appelle Ollama avec un prompt et retourne la réponse
 */
async function callOllama(prompt: string, systemPrompt?: string): Promise<string> {
  const body: any = {
    model: MODEL,
    prompt: prompt,
    stream: false,
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetch(`${OLLAMA_API}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.response || '';
}

/**
 * Parse le document de test et génère les appels MCP via l'IA
 */
export async function parseTestDocument(documentPath: string): Promise<MCPCall[]> {
  console.log(`📖 Lecture du document: ${documentPath}`);
  const rawDocument = fs.readFileSync(documentPath, 'utf-8');

  // Substitution simple des variables d'environnement dans le scénario
  // Exemple dans scenario.txt :
  // A.1: Saisir "${LOGIN_EMAIL}" dans le champ "#email"
  const document = rawDocument.replace(/\$\{([A-Z0-9_]+)\}/g, (match, varName) => {
    const value = process.env[varName];
    return value !== undefined ? value : match;
  });

  const systemPrompt = `Tu es un agent d'automatisation de tests IHM.
Tu dois analyser un document de test en français et générer une liste d'appels MCP (Model Context Protocol) pour Playwright.

Outils MCP disponibles:
- start: Lance le navigateur (aucun argument)
- open: Ouvre une URL (argument: url)
- fill: Remplit un champ (arguments: selector, value)
- click: Clique sur un élément (argument: selector)
- assertText: Vérifie qu'un texte est visible (argument: text)
- screenshot: Prend une capture d'écran (argument: path)
- stop: Ferme le navigateur (aucun argument)

RÈGLES ABSOLUES (INTERDICTION STRICTE DE LES VIOLER):

1. NE GÉNÈRE QUE LES ACTIONS EXPLICITEMENT MENTIONNÉES DANS LE DOCUMENT
2. N'AJOUTE AUCUNE ÉTAPE INTERMÉDIAIRE, AUCUNE ACTION SUPPLÉMENTAIRE, AUCUNE LOGIQUE
3. Si le document dit "Ouvrir URL, Cliquer, Vérifier", tu DOIS générer UNIQUEMENT: start, open, click, assertText, stop
4. N'INVENTE PAS d'actions comme fill, wait, navigate, etc. si elles ne sont PAS dans le document
5. UNE LIGNE DU DOCUMENT = UNE ACTION MCP (+ start au début + stop à la fin)
6. CHAQUE LIGNE COMMENCE PAR UN IDENTIFIANT (ex: "A.1:", "B.2:", "1."). EXTRAIT CET IDENTIFIANT et mets-le dans le champ "stepId"

Règles pour les sélecteurs:
- Si "text=" est présent, utilise-le TEL QUEL sans modification
- Si un sélecteur CSS (#id, .class, [attr]) est mentionné, utilise-le TEL QUEL
- Sinon, utilise "text=..." avec le texte entre guillemets

Mapping ligne → action:
- "X: Ouvrir URL" → open avec stepId: "X"
- "X: Cliquer sur Y" → click avec stepId: "X"
- "X: Saisir Y dans Z" → fill avec stepId: "X"
- "X: Vérifier que le texte Y est visible" → assertText avec stepId: "X"
- "X: Prendre une capture" → screenshot avec stepId: "X"

INTERDICTIONS STRICTES:
❌ N'ajoute PAS d'étapes de connexion si non mentionnées
❌ N'ajoute PAS de fill si non mentionné
❌ N'ajoute PAS de navigation intermédiaire
❌ Ne déduis RIEN, ne suppose RIEN
❌ Ne génère PAS de screenshot si non demandé (ils sont générés automatiquement)

Format de réponse (JSON array uniquement):
[
  {"name": "start", "arguments": {}, "stepId": "start"},
  {"name": "open", "arguments": {"url": "..."}, "stepId": "A.1"},
  {"name": "click", "arguments": {"selector": "..."}, "stepId": "A.2"},
  {"name": "stop", "arguments": {}, "stepId": "stop"}
]`;

  const userPrompt = `Analyse ce document de test et génère la liste des appels MCP à exécuter.

RÈGLES CRITIQUES:
1. Génère UNIQUEMENT les actions EXPLICITEMENT mentionnées dans le document
2. N'AJOUTE AUCUNE étape intermédiaire (pas de fill, pas de connexion, rien qui ne soit pas écrit)
3. EXTRAIT l'identifiant de chaque ligne (ex: "A.1", "B.2") et mets-le dans "stepId"
4. Ne génère PAS de screenshot (ils sont pris automatiquement après chaque étape)

Document de test:
${document}

Compte les lignes du document et génère EXACTEMENT le même nombre d'actions MCP (+ start + stop).
Chaque action DOIT avoir un "stepId" correspondant à l'identifiant de la ligne.
Génère uniquement le JSON array, sans texte supplémentaire.`;

  console.log('🤖 Appel à Ollama pour parser le document...');
  const response = await callOllama(userPrompt, systemPrompt);
  
  // Extraire le JSON de la réponse (peut contenir du markdown ou du texte autour)
  let jsonStr = response.trim();
  
  // Chercher un bloc JSON dans la réponse
  const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  // Nettoyer le JSON (enlever les backticks markdown si présents)
  jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const calls = JSON.parse(jsonStr) as MCPCall[];
    console.log(`✅ ${calls.length} appels MCP générés`);
    
    // Validation: vérifier que les sélecteurs text= du document sont préservés
    const documentLower = document.toLowerCase();
    calls.forEach((call, index) => {
      if (call.name === 'click' && call.arguments.selector) {
        const selector = call.arguments.selector;
        // Si le document contient "text=" mais le sélecteur généré ne l'a pas, avertir
        if (documentLower.includes('text=') && !selector.includes('text=') && !selector.startsWith('#') && !selector.startsWith('.')) {
          console.warn(`⚠️  Attention: Le sélecteur "${selector}" pour l'action ${index + 1} pourrait être incorrect.`);
          console.warn(`   Le document contient peut-être un sélecteur text= qui devrait être utilisé.`);
        }
      }
    });
    
    return calls;
  } catch (error) {
    console.error('❌ Erreur lors du parsing JSON:', error);
    console.error('Réponse de l\'IA:', response);
    throw new Error(`Impossible de parser la réponse de l'IA en JSON: ${error}`);
  }
}

/**
 * Liste les modèles Ollama disponibles
 */
export async function listOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_API}/api/tags`);
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles:', error);
    return [];
  }
}
