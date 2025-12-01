const fs = require('fs');
const path = require('path');

// Minimal 1x1 transparent ICO file (base64)
const icoBase64 = "AAABAAEAAQEAAAEAIAAwAAAAFgAAACgAAAABAAAAAgAAAAEAIAAAAAAABAAADqaOAQ6mjgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/w==";
const icoBuffer = Buffer.from(icoBase64, 'base64');

const iconPath = path.join('src-tauri', 'icons', 'icon.ico');
const dir = path.dirname(iconPath);

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(iconPath, icoBuffer);
console.log('Valid dummy icon.ico created at ' + iconPath);
