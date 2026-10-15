import http from 'http';

const req = http.get('http://localhost:9222/json', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const pages = JSON.parse(body);
      const targetPage = pages.find(p => p.url.includes('localhost:3000'));
      if (!targetPage) {
        console.error('Target page not found. Pages:', pages.map(p => p.url));
        process.exit(1);
      }
      console.log('Target WebSocket:', targetPage.webSocketDebuggerUrl);

      const ws = new globalThis.WebSocket(targetPage.webSocketDebuggerUrl);
      ws.onopen = () => {
        console.log('Connected to Chrome DevTools WebSocket.');
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
        ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
        ws.send(JSON.stringify({ id: 4, method: 'Page.reload' }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('\n🚨 RUNTIME EXCEPTION THROWN:');
          console.error(JSON.stringify(msg.params.exceptionDetails, null, 2));
        } else if (msg.method === 'Runtime.consoleAPICalled') {
          console.log(`\n📢 CONSOLE [${msg.params.type}]:`, msg.params.args.map(a => a.value || a.description).join(' '));
        } else if (msg.method === 'Log.entryAdded') {
          console.log(`\n📄 LOG [${msg.params.entry.level}]:`, msg.params.entry.text);
        }
      };

      setTimeout(() => {
        console.log('\nDone.');
        ws.close();
        process.exit(0);
      }, 4000);
    } catch (e) {
      console.error('Error:', e);
    }
  });
});
req.on('error', err => console.error('HTTP error:', err));
