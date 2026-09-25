const path = require('path');
const fs = require('fs');
if ((process.env.VERCEL || process.env.RENDER) && !process.env.REACT_APP_BACKEND_URL) {
  console.error('Build stopped: set REACT_APP_BACKEND_URL in your hosting environment; development defaults are not valid for hosting.');
  process.exit(1);
}
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, '# Build values are supplied by the hosting environment.\n', { flag: 'wx' });
}
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), override: false });
require('dotenv').config({ path: envPath, override: false });

const value = process.env.REACT_APP_BACKEND_URL;
if (!value) {
  console.error('Build stopped: REACT_APP_BACKEND_URL must be set to your hosted backend origin.');
  process.exit(1);
}
try {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || !['', '/'].includes(url.pathname) || url.search || url.hash || url.username || url.password) {
    throw new Error('Use only the backend origin without /api, credentials, query parameters or a fragment.');
  }
  console.log('KisanGyan backend origin configuration is valid.');
} catch (error) {
  console.error('Invalid REACT_APP_BACKEND_URL:', error.message);
  process.exit(1);
}