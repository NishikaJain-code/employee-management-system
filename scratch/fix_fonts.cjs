const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, '../frontend/src/pages'),
  path.join(__dirname, '../frontend/src/components')
];

// We want to fix text colors but preserve them on specific items like solid background buttons.
// The easiest way is to replace color: "#fff" -> color: "var(--text-primary)" globally.
// Buttons with linear-gradient might have their text turn black in light mode.
// We can live with that or fix it. Let's do a global replace for #fff as text.

const mappings = [
  { regex: /color:\s*['"]#fff['"]/gi, replacement: 'color: "var(--text-primary)"' },
  { regex: /color:\s*['"]#ffffff['"]/gi, replacement: 'color: "var(--text-primary)"' },
  { regex: /color:\s*['"]#000['"]/gi, replacement: 'color: "var(--text-primary)"' },
  { regex: /color:\s*['"]#000000['"]/gi, replacement: 'color: "var(--text-primary)"' },
  { regex: /background:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.9\)['"]/gi, replacement: 'background: "var(--bg-card)"' },
  { regex: /color:\s*['"]#4a5568['"]/gi, replacement: 'color: "var(--text-secondary)"' },
  { regex: /color:\s*['"]#e2e8f0['"]/gi, replacement: 'color: "var(--text-primary)"' },
  { regex: /color:\s*['"]#2d3748['"]/gi, replacement: 'color: "var(--text-primary)"' }
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
        console.log("Fixed:", fullPath);
      }
    }
  });
}

dirs.forEach(d => { if (fs.existsSync(d)) processDir(d); });
