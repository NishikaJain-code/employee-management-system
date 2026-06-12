const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, '../frontend/src/pages'),
  path.join(__dirname, '../frontend/src/components')
];

const mappings = [
  { regex: /background:\s*['"]#fff['"]/gi, replacement: 'background: "var(--bg-card)"' },
  { regex: /background:\s*['"]#ffffff['"]/gi, replacement: 'background: "var(--bg-card)"' },
  { regex: /background:\s*['"]#f0f4ff['"]/gi, replacement: 'background: "var(--bg-main)"' },
  { regex: /color:\s*['"]#555['"]/gi, replacement: 'color: "var(--text-secondary)"' },
  { regex: /color:\s*['"]#aaa['"]/gi, replacement: 'color: "var(--text-muted)"' }
];

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let orig = content;
      mappings.forEach(m => {
        content = content.replace(m.regex, m.replacement);
      });
      if (content !== orig) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log("Fixed BG:", fullPath);
      }
    }
  });
}

dirs.forEach(d => { if (fs.existsSync(d)) processDir(d); });
