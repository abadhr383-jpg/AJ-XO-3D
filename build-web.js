// Copies the game into ./www (Capacitor's webDir)
const fs = require('fs');
fs.rmSync('www', { recursive: true, force: true });
fs.mkdirSync('www', { recursive: true });
['index.html', 'style.css', 'script.js'].forEach(f => fs.copyFileSync(f, 'www/' + f));
fs.cpSync('assets', 'www/assets', { recursive: true });
console.log('www/ ready');
