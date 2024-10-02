const fs = require('fs');
const path = require('path');

const excludedDirs = ['node_modules', '.next', '.git', '.vscode'];

function generateTree(dir, prefix = '') {
    let result = '';
    const files = fs.readdirSync(dir);

    files.forEach((file, index) => {
        if (excludedDirs.includes(file)) return;

        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const isLast = index === files.length - 1;

        result += `${prefix}${isLast ? '└─' : '├─'}${file}\n`;

        if (stats.isDirectory()) {
            result += generateTree(filePath, `${prefix}${isLast ? '   ' : '│  '}`);
        }
    });

    return result;
}

const rootDir = process.cwd();
const tree = generateTree(rootDir);

fs.writeFileSync('폴더 구조.md', tree);
console.log('Folder structure has been saved to 폴더 구조.md');