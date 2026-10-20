const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Automatically load ../.env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const idx = line.indexOf('=');
      if (idx !== -1) {
        const key = line.substring(0, idx).trim();
        let val = line.substring(idx + 1).trim();
        // Remove surrounding quotes if any
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  });
  console.log('[fitempire-backend] Loaded root .env environment configuration.');
}

const isWin = process.platform === 'win32';
const mvnCmd = isWin ? 'mvn.cmd' : 'mvn';

const child = spawn(mvnCmd, ['spring-boot:run', '-Dspring-boot.run.profiles=dev'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
