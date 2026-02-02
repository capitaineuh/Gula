import fs from 'fs';

const ENDPOINT = 'http://localhost:3031';

async function callTool(name: string, args: any = {}) {
  const fetchFn = globalThis.fetch;
  if (!fetchFn) throw new Error('fetch n’est pas disponible dans cet environnement Node');
  const body = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'call_tool',
    params: { name, arguments: args },
  };
  const res = await fetchFn(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json() as { error?: unknown; result?: unknown };
  if (json && typeof json === 'object' && 'error' in json && json.error) {
    const msg = typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
    throw new Error(msg);
  }
  return (json as any).result;
}

function parseLine(line: string) {
  line = line.trim();
  if (!line) return null;
  // Très simplifié : adapte si besoin
  if (line.toLowerCase().startsWith('ouvrir ')) {
    const url = line.substring(7).trim();
    return { name: 'open', args: { url } };
  }
  if (line.toLowerCase().startsWith('saisir ')) {
    const m = line.match(/^Saisir "(.*)" dans le champ "(.*)"$/i);
    if (m) return { name: 'fill', args: { value: m[1], selector: m[2] } };
  }
  if (line.toLowerCase().startsWith('cliquer ')) {
    const m = line.match(/^Cliquer sur "(.*)"$/i);
    if (m) return { name: 'click', args: { selector: m[1] } };
  }
  if (line.toLowerCase().startsWith('vérifier') || line.toLowerCase().startsWith('verifier')) {
    const m = line.match(/^V[ée]rifier que le texte "(.*)" est visible$/i);
    if (m) return { name: 'assertText', args: { text: m[1] } };
  }
  if (line.toLowerCase().startsWith('prendre une capture')) {
    const m = line.match(/^Prendre une capture d.?écran nommée "(.*)"$/i);
    if (m) return { name: 'screenshot', args: { path: m[1] } };
  }
  throw new Error(`Étape non reconnue: ${line}`);
}

async function run() {
  const lines = fs.readFileSync('scenario.txt', 'utf-8').split('\n');
  console.log('--- start');
  await callTool('start');
  for (const line of lines) {
    if (!line.trim()) continue;
    const step = parseLine(line);
    if (!step) continue;
    console.log(`→ ${line}`);
    await callTool(step.name, step.args);
    console.log('  ok');
  }
  await callTool('screenshot', { path: 'final.png' }); // optionnel
  await callTool('stop');
  console.log('--- done');
}

run().catch(async (e) => {
  console.error('Erreur:', e.message);
  try { await callTool('stop'); } catch {}
  process.exit(1);
});