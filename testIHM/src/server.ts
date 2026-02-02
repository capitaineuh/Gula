// src/server.ts
import { chromium, Browser, Page } from 'playwright';
import http from 'http';

type ToolName = 'start' | 'open' | 'fill' | 'click' | 'assertText' | 'screenshot' | 'stop';

let browser: Browser | null = null;
let page: Page | null = null;

async function ensurePage() {
  if (!browser) browser = await chromium.launch({ headless: false });
  if (!page) {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
  }
}

async function handleTool(name: ToolName, args: any) {
  switch (name) {
    case 'start':
      await ensurePage();
      return { ok: true };
    case 'open':
      await ensurePage();
      await page!.goto(args.url, { waitUntil: 'networkidle' });
      return { ok: true };
    case 'fill':
      await page!.fill(args.selector, args.value);
      return { ok: true };
    case 'click':
      await page!.click(args.selector);
      return { ok: true };
    case 'assertText':
      await page!.locator(`text=${args.text}`).waitFor({ state: 'visible', timeout: 5000 });
      return { ok: true };
    case 'screenshot':
      await page!.screenshot({ path: args.path ?? 'screenshot.png', fullPage: true });
      return { ok: true };
    case 'stop':
      await browser?.close();
      browser = null; page = null;
      return { ok: true };
    default:
      throw new Error(`Unknown tool ${name}`);
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
server.listen(PORT, () => {
  console.log(`MCP Playwright server running on http://localhost:${PORT}`);
});