const fs = require('fs');
const path = require('path');

const directoriesToProcess = [
  path.join(__dirname, '../frontend/src/pages'),
  path.join(__dirname, '../frontend/src/components')
];

const colorMappings = [
  { regex: /#05070a/gi, replacement: 'var(--bg-main)' },
  { regex: /rgba\(18,\s*25,\s*38,\s*0\.[57]\)/gi, replacement: 'var(--bg-card)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.04\)/gi, replacement: 'var(--bg-input)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.02\)/gi, replacement: 'var(--bg-hover)' },
  { regex: /#f1f5f9/gi, replacement: 'var(--text-primary)' },
  { regex: /#94a3b8/gi, replacement: 'var(--text-secondary)' },
  { regex: /#64748b/gi, replacement: 'var(--text-muted)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.05\)/gi, replacement: 'var(--border-light)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.08\)/gi, replacement: 'var(--border-medium)' },
  { regex: /#00FFC2/gi, replacement: 'var(--accent-cyan)' },
  { regex: /#00B8FF/gi, replacement: 'var(--accent-blue)' },
  { regex: /#FF00E5/gi, replacement: 'var(--accent-pink)' },
  { regex: /#7B61FF/gi, replacement: 'var(--accent-purple)' },
  { regex: /#FFB800/gi, replacement: 'var(--accent-yellow)' },
  { regex: /#FF3D71/gi, replacement: 'var(--accent-red)' },
  { regex: /#080B13/gi, replacement: 'var(--bg-main)' },
  { regex: /#121926/gi, replacement: 'var(--bg-card)' }
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  colorMappings.forEach(mapping => {
    content = content.replace(mapping.regex, mapping.replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

directoriesToProcess.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
});

console.log('Theme conversion completed!');
