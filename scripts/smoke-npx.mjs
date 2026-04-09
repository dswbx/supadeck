import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const projectRoot = process.cwd();
const tmpRoot = path.join(projectRoot, '.tmp');
const cliArgs = process.argv.slice(2);

async function ensureCleanDirectory(directoryPath) {
  await fs.rm(directoryPath, { recursive: true, force: true });
  await fs.mkdir(directoryPath, { recursive: true });
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? projectRoot,
      env: options.env ?? process.env,
      stdio: 'inherit',
      shell: false
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited from signal ${signal}`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
        return;
      }

      resolve();
    });
  });
}

async function main() {
  await fs.mkdir(tmpRoot, { recursive: true });
  const runRoot = await fs.mkdtemp(path.join(tmpRoot, 'smoke-npx-'));
  const cacheDir = path.join(runRoot, 'npm-cache');
  const packDir = path.join(runRoot, 'pack');
  const extractDir = path.join(runRoot, 'extract');
  const workspaceDir = path.join(runRoot, 'workspace');
  const binDir = path.join(runRoot, 'bin');

  await ensureCleanDirectory(cacheDir);
  await ensureCleanDirectory(packDir);
  await ensureCleanDirectory(extractDir);
  await ensureCleanDirectory(workspaceDir);
  await ensureCleanDirectory(binDir);

  const packageJson = JSON.parse(
    await fs.readFile(path.join(projectRoot, 'package.json'), 'utf8')
  );
  const tarballName = `${packageJson.name}-${packageJson.version}.tgz`;
  const tarballPath = path.join(packDir, tarballName);

  await run('npm', ['pack', '--pack-destination', packDir], {
    env: {
      ...process.env,
      npm_config_cache: cacheDir
    }
  });

  await run('tar', ['-xzf', tarballPath, '-C', extractDir]);

  const packagedCliPath = path.join(extractDir, 'package', 'dist', 'cli', 'index.js');
  const linkedCliPath = path.join(binDir, packageJson.name);

  await fs.symlink(packagedCliPath, linkedCliPath);

  console.log(`\nSmoke run: ${runRoot}`);
  console.log(`Running packaged CLI in ${workspaceDir}`);
  console.log(`Tarball: ${tarballPath}`);
  console.log(`CLI symlink: ${linkedCliPath}`);

  await run('node', [linkedCliPath, ...cliArgs], {
    cwd: workspaceDir,
    env: process.env
  });
}

main().catch((error) => {
  console.error(`\n[smoke:npx] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
