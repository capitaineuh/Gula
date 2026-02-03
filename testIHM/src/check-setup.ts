/**
 * Script de vérification de la configuration
 */

async function checkSetup() {
  console.log('🔍 Vérification de la configuration...\n');

  let allOk = true;

  // 1. Vérifier Ollama
  console.log('1. Vérification d\'Ollama...');
  try {
    const ollamaUrl = process.env.OLLAMA_API || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      console.log(`   ✅ Ollama accessible (${models.length} modèles disponibles)`);
      if (models.length > 0) {
        console.log(`   📦 Modèles: ${models.map((m: any) => m.name).join(', ')}`);
      } else {
        console.log('   ⚠️  Aucun modèle installé. Exécutez: ollama pull llama3.2:1b');
      }
    } else {
      console.log('   ❌ Ollama ne répond pas correctement');
      allOk = false;
    }
  } catch (error: any) {
    console.log(`   ❌ Ollama inaccessible: ${error.message}`);
    console.log('   💡 Assurez-vous qu\'Ollama est démarré: ollama serve');
    allOk = false;
  }

  // 2. Vérifier le serveur MCP
  console.log('\n2. Vérification du serveur MCP...');
  try {
    const mcpUrl = process.env.MCP_ENDPOINT || 'http://localhost:3031';
    const response = await fetch(mcpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'list_tools',
        params: {},
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const tools = data.result?.tools || [];
      console.log(`   ✅ Serveur MCP accessible (${tools.length} outils disponibles)`);
      console.log(`   🛠️  Outils: ${tools.map((t: any) => t.name).join(', ')}`);
    } else {
      console.log('   ❌ Serveur MCP ne répond pas correctement');
      allOk = false;
    }
  } catch (error: any) {
    console.log(`   ❌ Serveur MCP inaccessible: ${error.message}`);
    console.log('   💡 Démarrez le serveur: npm run dev');
    allOk = false;
  }

  // 3. Vérifier Playwright
  console.log('\n3. Vérification de Playwright...');
  try {
    const { chromium } = await import('playwright');
    console.log('   ✅ Playwright installé');
  } catch (error: any) {
    console.log(`   ❌ Playwright non disponible: ${error.message}`);
    console.log('   💡 Installez Playwright: npx playwright install');
    allOk = false;
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  if (allOk) {
    console.log('✅ Configuration OK! Vous pouvez lancer les tests avec: npm run test');
  } else {
    console.log('❌ Certains éléments nécessitent une attention');
    console.log('\n📚 Consultez le README.md pour plus d\'informations');
  }
}

checkSetup().catch(console.error);
