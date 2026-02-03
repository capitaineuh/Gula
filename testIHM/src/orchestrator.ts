/**
 * Orchestrateur principal qui coordonne l'IA et l'exécution des tests
 */

import { parseTestDocument, MCPCall } from './agent';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env
dotenv.config();

const MCP_ENDPOINT = process.env.MCP_ENDPOINT || 'http://localhost:3031';

// Configuration du mécanisme de retry par étape
const STEP_TIMEOUT_MS =
  (process.env.STEP_TIMEOUT_MS ? Number(process.env.STEP_TIMEOUT_MS) : undefined) ?? 10_000;
const STEP_RETRY_INTERVAL_MS =
  (process.env.STEP_RETRY_INTERVAL_MS ? Number(process.env.STEP_RETRY_INTERVAL_MS) : undefined) ?? 500;

// Dossier de sortie des tests
const TEST_OUTPUT_DIR = path.join(process.cwd(), 'test-output');
const SCREENSHOTS_DIR = path.join(TEST_OUTPUT_DIR, 'screenshots');
const SCREENSHOTS_SUCCESS = path.join(SCREENSHOTS_DIR, 'success');
const SCREENSHOTS_FAILED = path.join(SCREENSHOTS_DIR, 'failed');
const LOG_FILE = path.join(TEST_OUTPUT_DIR, 'test.log');

// Contenu du log en mémoire
let logContent: string[] = [];

/**
 * Ajoute une entrée au log (console + fichier)
 */
function log(message: string, toConsole = true): void {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}`;
  logContent.push(logLine);
  if (toConsole) {
    console.log(message);
  }
}

/**
 * Sauvegarde le log dans le fichier
 */
function saveLog(): void {
  fs.writeFileSync(LOG_FILE, logContent.join('\n'), 'utf-8');
}

/**
 * Vide et recrée le dossier test-output
 */
function resetTestOutputDir(): void {
  if (fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOTS_SUCCESS, { recursive: true });
  fs.mkdirSync(SCREENSHOTS_FAILED, { recursive: true });
}

/**
 * Appelle un outil MCP sur le serveur Playwright
 */
async function callMCPTool(name: string, args: Record<string, any> = {}): Promise<any> {
  const body = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'call_tool',
    params: { name, arguments: args },
  };

  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as { error?: any; result?: any };
  
  if (json.error) {
    const errorMsg = typeof json.error === 'string' 
      ? json.error 
      : JSON.stringify(json.error);
    throw new Error(`MCP error: ${errorMsg}`);
  }

  return json.result;
}

/**
 * Vérifie que le serveur MCP est disponible
 */
async function checkMCPServer(): Promise<boolean> {
  try {
    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'list_tools',
        params: {},
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Prend une capture d'écran et la sauvegarde
 */
async function takeScreenshot(screenshotPath: string): Promise<void> {
  const dir = path.dirname(screenshotPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await callMCPTool('screenshot', { path: screenshotPath });
}

/**
 * Appelle un outil MCP avec retry pendant une durée maximale
 * (pour laisser à Playwright le temps de trouver l'élément, etc.)
 */
async function executeWithRetry(
  name: string,
  args: Record<string, any>,
  stepId: string,
  timeoutMs: number = STEP_TIMEOUT_MS,
  retryIntervalMs: number = STEP_RETRY_INTERVAL_MS,
): Promise<void> {
  const start = Date.now();
  let lastError: any;

  while (Date.now() - start < timeoutMs) {
    try {
      await callMCPTool(name, args);
      return;
    } catch (error: any) {
      lastError = error;
      // On attend un peu avant de retenter
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
    }
  }

  const baseMsg = `Échec de l'étape "${stepId}" après ${timeoutMs}ms`;
  const errorMsg = lastError?.message ? `: ${lastError.message}` : '';
  throw new Error(baseMsg + errorMsg);
}

/**
 * Exécute une liste d'appels MCP
 * - Chaque action est retentée pendant STEP_TIMEOUT_MS ms maximum
 * - En cas d'échec: screenshot dans "failed" puis on passe à l'étape suivante
 * - À la fin, on retourne un indicateur global de succès/échec
 */
async function executeMCPCalls(
  calls: MCPCall[],
): Promise<{ testFailed: boolean; failedSteps: string[] }> {
  // S'assurer qu'on termine toujours par stop (fermer le navigateur)
  const lastCall = calls[calls.length - 1];
  if (!lastCall || lastCall.name !== 'stop') {
    calls = [...calls, { name: 'stop', arguments: {} }];
    log('📌 Fermeture du navigateur ajoutée en fin de scénario.\n');
  }

  log(`\n🚀 Exécution de ${calls.length} actions...\n`);

  let testFailed = false;
  const failedSteps: string[] = [];
  let lastStepId = 'unknown';
  
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    const stepId = call.stepId || `step-${i + 1}`;
    lastStepId = stepId;
    
    try {
      let args = { ...call.arguments };
      
      // Pour les screenshots demandés dans le scénario, utiliser le stepId
      if (call.name === 'screenshot') {
        const filename = `${stepId}.png`;
        args = { ...args, path: path.join(SCREENSHOTS_SUCCESS, filename) };
      }

      log(`[${stepId}] ${call.name} ${JSON.stringify(args)}`);
      
      const startTime = Date.now();

      // On applique le mécanisme de retry sur toutes les étapes
      await executeWithRetry(call.name, args, stepId);

      const duration = Date.now() - startTime;
      
      log(`  ✅ Succès (${duration}ms)\n`);
      
      // Capture automatique après chaque étape de test (sauf start/stop/screenshot)
      if (call.name !== 'start' && call.name !== 'stop' && call.name !== 'screenshot') {
        const autoScreenPath = path.join(SCREENSHOTS_SUCCESS, `${stepId}.png`);
        try {
          await takeScreenshot(autoScreenPath);
          log(`  📸 Capture automatique: ${autoScreenPath}`);
        } catch (screenshotError) {
          // Ignorer les erreurs de screenshot automatique
        }
      }
      
    } catch (error: any) {
      testFailed = true;
      failedSteps.push(stepId);
      log(`  ❌ Erreur après retry: ${error.message}\n`);
      
      // Prendre une capture d'écran en cas d'erreur → screenshots/failed
      try {
        const failedPath = path.join(SCREENSHOTS_FAILED, `${stepId}.png`);
        await takeScreenshot(failedPath);
        log(`  📸 Capture d'écran d'erreur: ${failedPath}`);
      } catch (screenshotError) {
        log(`  ⚠️  Impossible de prendre la capture d'erreur`);
      }
      
      // IMPORTANT: on NE s'arrête plus au premier échec.
      // On passe simplement à l'étape suivante.
    }
  }
  
  // Sauvegarder le log à la fin
  saveLog();

  return { testFailed, failedSteps };
}

/**
 * Fonction principale
 */
async function main() {
  // Réinitialiser le dossier de sortie
  resetTestOutputDir();
  logContent = [];
  
  log('🎯 Orchestrateur de tests automatisés\n');
  log('=' .repeat(50));

  // Récupérer le fichier de test depuis les arguments ou utiliser un défaut
  const testFile = process.argv[2] || 'src/scenario.txt';
  const testFilePath = path.resolve(process.cwd(), testFile);

  if (!fs.existsSync(testFilePath)) {
    log(`❌ Fichier de test introuvable: ${testFilePath}`);
    log('\nUsage: npm run test [chemin-vers-document.txt]');
    saveLog();
    process.exit(1);
  }

  log(`📁 Dossier test-output/ réinitialisé`);
  log(`📁 Screenshots → test-output/screenshots/success et test-output/screenshots/failed`);
  log(`📁 Logs → test-output/test.log\n`);

  // Vérifier que le serveur MCP est disponible
  log('🔍 Vérification du serveur MCP...');
  const serverAvailable = await checkMCPServer();
  if (!serverAvailable) {
    log(`❌ Serveur MCP non disponible sur ${MCP_ENDPOINT}`);
    log('💡 Assure-toi que le serveur est démarré: npm run dev');
    saveLog();
    process.exit(1);
  }
  log('✅ Serveur MCP disponible\n');

  try {
    // Étape 1: Parser le document avec l'IA
    log('📝 Étape 1: Analyse du document avec l\'IA...');
    const calls = await parseTestDocument(testFilePath);
    
    // Afficher le plan d'exécution
    log('\n📋 Plan d\'exécution généré:');
    calls.forEach((call) => {
      const stepId = call.stepId || '?';
      log(`  [${stepId}] ${call.name} ${JSON.stringify(call.arguments)}`);
    });

    // Étape 2: Exécuter les appels MCP (avec retry + poursuite en cas d'erreur)
    log('\n📝 Étape 2: Exécution des tests...');
    const { testFailed, failedSteps } = await executeMCPCalls(calls);

    log('\n' + '='.repeat(50));
    if (testFailed) {
      log('⚠️ Scénario terminé avec des erreurs sur certaines étapes.');
      if (failedSteps.length > 0) {
        log(`Étapes en échec: ${failedSteps.join(', ')}`);
      }
      log(`\n📁 Résultats dans: ${TEST_OUTPUT_DIR}`);
      saveLog();
      // On marque le process comme en échec pour le CI/CD,
      // mais seulement après avoir exécuté toutes les étapes.
      process.exitCode = 1;
    } else {
      log('✅ Tous les tests ont été exécutés avec succès!');
      log(`\n📁 Résultats dans: ${TEST_OUTPUT_DIR}`);
      saveLog();
    }

  } catch (error: any) {
    log('\n' + '='.repeat(50));
    log(`❌ Erreur lors de l'exécution: ${error.message}`);
    log(`\n📁 Résultats dans: ${TEST_OUTPUT_DIR}`);
    saveLog();
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch((error) => {
    log(`Erreur fatale: ${error}`);
    saveLog();
    process.exit(1);
  });
}

export { executeMCPCalls, callMCPTool, log };
