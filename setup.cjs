const fs = require('fs');
const path = require('path');

// Ensure directories exist
['public', 'src', 'src/types', 'src/lib', 'src/components'].forEach(dir => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

console.log('✅ Directories ready!');