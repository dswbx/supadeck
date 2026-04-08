import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const runtimeSource = path.join(projectRoot, 'src', 'runtime');
const runtimeTarget = path.join(projectRoot, 'dist', 'runtime');

async function copyFile(sourcePath, targetPath) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  let content = await fs.readFile(sourcePath);

  if (path.basename(sourcePath) === 'index.html') {
    content = Buffer.from(String(content).replace('./main.tsx', './main.js'));
  }

  await fs.writeFile(targetPath, content);
}

async function copyRuntimeAssets(currentSource = runtimeSource, currentTarget = runtimeTarget) {
  const entries = await fs.readdir(currentSource, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(currentSource, entry.name);
    const targetPath = path.join(currentTarget, entry.name);

    if (entry.isDirectory()) {
      await copyRuntimeAssets(sourcePath, targetPath);
      continue;
    }

    if (/\.(css|html)$/.test(entry.name)) {
      await copyFile(sourcePath, targetPath);
    }
  }
}

await copyRuntimeAssets();
