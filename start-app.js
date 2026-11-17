const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('✨ Launching SpendQuest – Smart Expense Tracker ✨');
console.log('   Tagline: "Track. Plan. Grow."');
console.log('====================================================\n');

// 1. Start Backend Express API (Port 5001)
console.log('Starting Backend API on port 5001...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

// 2. Start Frontend Vite Server (Port 3000)
console.log('Starting Frontend React UI on port 3000...');
const frontend = spawn('node', ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0', '--port', '3000'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit'
});

backend.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

frontend.on('exit', (code) => {
  console.log(`Frontend process exited with code ${code}`);
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
