const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

walk('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Background and text replacements
    content = content.replace(/bg-black/g, 'bg-white');
    content = content.replace(/text-white/g, 'text-gray-900');
    content = content.replace(/text-zinc-300/g, 'text-gray-600');
    content = content.replace(/text-zinc-400/g, 'text-gray-500');
    content = content.replace(/text-zinc-500/g, 'text-gray-400');
    content = content.replace(/bg-\[\#050505\]/g, 'bg-gray-50');
    
    // Light mode borders and translucency
    content = content.replace(/border-white\/10/g, 'border-gray-200');
    content = content.replace(/border-white\/20/g, 'border-gray-200');
    content = content.replace(/bg-white\/5/g, 'bg-gray-50');
    content = content.replace(/bg-white\/10/g, 'bg-gray-100');
    content = content.replace(/bg-white\/20/g, 'bg-gray-200');
    content = content.replace(/border-surface-hover\/30/g, 'border-gray-100');
    content = content.replace(/border-surface-hover/g, 'border-gray-100');
    
    // Specific elements
    content = content.replace(/text-muted hover:text-white/g, 'text-muted hover:text-gray-900');
    content = content.replace(/fill-white/g, 'fill-gray-900');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
