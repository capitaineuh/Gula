// src/server.ts
import { chromium, Browser, Page } from 'playwright';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Charger les variables d'environnement depuis .env (cherche depuis le répertoire courant)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

type ToolName = 'start' | 'open' | 'fill' | 'click' | 'assertText' | 'screenshot' | 'stop';

let browser: Browser | null = null;
let page: Page | null = null;

async function ensurePage() {
  if (!browser) {
    console.log('🌐 Lancement du navigateur...');
    // Vérifier la variable HEADLESS (string depuis .env)
    const headlessEnv = process.env.HEADLESS?.toLowerCase().trim();
    const isHeadless = headlessEnv !== 'false'; // false seulement si explicitement "false"
    
    console.log(`📋 HEADLESS depuis .env: "${process.env.HEADLESS}"`);
    console.log(`🌐 Mode headless: ${isHeadless} (false = navigateur visible, true = headless)`);
    
    browser = await chromium.launch({ 
      headless: isHeadless,
      slowMo: 100 // Ralentit les actions pour mieux voir ce qui se passe
    });
    
    if (!isHeadless) {
      console.log('✅ Navigateur lancé en mode VISIBLE - tu devrais voir la fenêtre s\'ouvrir');
    }
  }
  if (!page) {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
    console.log('📄 Nouvelle page créée');
  }
}

async function handleTool(name: ToolName, args: any) {
  try {
    switch (name) {
      case 'start':
        await ensurePage();
        return { ok: true, message: 'Navigateur lancé' };
      
      case 'open':
        await ensurePage();
        if (!args.url) {
          throw new Error('URL manquante pour open');
        }
        console.log(`  → Navigation vers: ${args.url}`);
        await page!.goto(args.url, { waitUntil: 'networkidle', timeout: 30000 });
        return { ok: true, message: `Page chargée: ${args.url}` };
      
      case 'fill':
        if (!args.selector || args.value === undefined) {
          throw new Error('selector et value requis pour fill');
        }
        console.log(`  → Remplissage: ${args.selector} = "${args.value}"`);
        await page!.fill(args.selector, args.value);
        return { ok: true, message: `Champ rempli: ${args.selector}` };
      
      case 'click':
        if (!args.selector) {
          throw new Error('selector requis pour click');
        }
        console.log(`  → Clic sur: ${args.selector}`);
        await page!.click(args.selector, { timeout: 10000 });
        return { ok: true, message: `Clic effectué: ${args.selector}` };
      
      case 'assertText':
        if (!args.text) {
          throw new Error('text requis pour assertText');
        }
        console.log(`  → Vérification du texte: "${args.text}"`);
        await page!.locator(`text=${args.text}`).waitFor({ 
          state: 'visible', 
          timeout: 10000 
        });
        return { ok: true, message: `Texte trouvé: "${args.text}"` };
      
      case 'screenshot':
        const screenshotPath = args.path ?? `screenshot-${Date.now()}.png`;
        const dir = path.dirname(screenshotPath);
        if (dir && dir !== '.') {
          fs.mkdirSync(dir, { recursive: true });
        }
        console.log(`  → Capture d'écran: ${screenshotPath}`);
        await page!.screenshot({ path: screenshotPath, fullPage: true });
        return { ok: true, message: `Capture sauvegardée: ${screenshotPath}`, path: screenshotPath };
      
      case 'stop':
        console.log('🛑 Fermeture du navigateur...');
        await browser?.close();
        browser = null; 
        page = null;
        return { ok: true, message: 'Navigateur fermé' };
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`  ❌ Erreur dans ${name}:`, error.message);
    throw error;
  }
}

// Serveur MCP minimal (JSON-RPC sur HTTP POST)
const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  const body = await new Promise<string>((resolve) => {
    let data = ''; req.on('data', c => data += c); req.on('end', () => resolve(data));
  });

  try {
    const msg = JSON.parse(body);
    // MCP call_tool : { jsonrpc, id, method: "call_tool", params: { name, arguments } }
    if (msg.method === 'call_tool') {
      const result = await handleTool(msg.params.name as ToolName, msg.params.arguments || {});
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result }));
    }
    // Expose la liste des tools
    if (msg.method === 'list_tools') {
      const tools = [
        { name: 'start', description: 'Lance le navigateur' },
        { name: 'open', description: 'Ouvre une URL', input_schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
        { name: 'fill', description: 'Remplit un champ', input_schema: { type: 'object', properties: { selector: { type: 'string' }, value: { type: 'string' } }, required: ['selector','value'] } },
        { name: 'click', description: 'Clique sur un sélecteur', input_schema: { type: 'object', properties: { selector: { type: 'string' } }, required: ['selector'] } },
        { name: 'assertText', description: 'Attend un texte visible', input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
        { name: 'screenshot', description: 'Capture écran', input_schema: { type: 'object', properties: { path: { type: 'string' } }, required: [] } },
        { name: 'stop', description: 'Ferme le navigateur' },
      ];
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { tools } }));
    }
    res.statusCode = 400; res.end('Unknown method');
  } catch (e: any) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: e.message }));
  }
});

// Port par défaut déplacé à 3031 pour éviter les conflits
const PORT = process.env.PORT || 3031;

// Afficher la configuration au démarrage
console.log('\n📋 Configuration du serveur MCP:');
console.log(`   PORT: ${PORT}`);
console.log(`   HEADLESS: ${process.env.HEADLESS || 'non défini (défaut: true)'}`);
console.log(`   OLLAMA_MODEL: ${process.env.OLLAMA_MODEL || 'non défini'}\n`);

server.listen(PORT, () => {
  console.log(`✅ MCP Playwright server running on http://localhost:${PORT}`);
  console.log(`   Mode headless: ${process.env.HEADLESS === 'false' ? 'VISIBLE (fenêtre s\'ouvrira)' : 'HEADLESS (pas de fenêtre)'}\n`);
});