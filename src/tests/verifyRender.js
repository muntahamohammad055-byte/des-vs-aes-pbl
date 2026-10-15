import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Mock browser globals needed by some modules
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};
globalThis.window = {
  crypto: globalThis.crypto,
  print: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};

async function testRender() {
  console.log('🚀 Initializing Vite SSR runner to test all pages and components...');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  const pages = [
    { name: 'DashboardPage', path: '/src/pages/DashboardPage.jsx', props: { setActiveTab: () => {} } },
    { name: 'EncryptDecryptPage', path: '/src/pages/EncryptDecryptPage.jsx', props: {} },
    { name: 'BenchmarkPage', path: '/src/pages/BenchmarkPage.jsx', props: { benchmarkResults: [], setBenchmarkResults: () => {} } },
    { name: 'ChartsPage', path: '/src/pages/ChartsPage.jsx', props: { benchmarkResults: [] } },
    { name: 'SecurityAnalysisPage', path: '/src/pages/SecurityAnalysisPage.jsx', props: {} },
    { name: 'VisualizationPage', path: '/src/pages/VisualizationPage.jsx', props: {} },
    { name: 'ExperimentsPage', path: '/src/pages/ExperimentsPage.jsx', props: {} },
    { name: 'MethodologyPage', path: '/src/pages/MethodologyPage.jsx', props: {} },
    { name: 'DocumentationPage', path: '/src/pages/DocumentationPage.jsx', props: { benchmarkResults: [] } },
    { name: 'TestPage', path: '/src/pages/TestPage.jsx', props: {} },
    { name: 'App Root Component', path: '/src/App.jsx', props: {} }
  ];

  let errors = 0;

  for (const page of pages) {
    try {
      const mod = await vite.ssrLoadModule(page.path);
      const Component = mod.default;
      const html = renderToString(React.createElement(Component, page.props));
      console.log(`✅ ${page.name}: Rendered successfully (${html.length} bytes HTML)`);
    } catch (err) {
      console.error(`❌ ${page.name} FAILED TO RENDER:`);
      console.error(err);
      errors++;
    }
  }

  await vite.close();

  if (errors === 0) {
    console.log('\n🎉 ALL 11 PAGES AND ROOT APP COMPONENT RENDER 100% CLEANLY WITH ZERO ERRORS!');
    process.exit(0);
  } else {
    console.error(`\n💥 Encountered ${errors} render error(s).`);
    process.exit(1);
  }
}

testRender().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
