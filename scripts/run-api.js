#!/usr/bin/env node
/**
 * Starts the Flask API (or its test suite) from npm, on any platform.
 *
 * Prefers the virtualenv in API/.venv so `npm run dev:all` works without the
 * developer having to activate anything first.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const apiDir = join(root, 'API');
const isWindows = process.platform === 'win32';

const venvPython = join(apiDir, '.venv', isWindows ? 'Scripts/python.exe' : 'bin/python');
const python = existsSync(venvPython) ? venvPython : isWindows ? 'python' : 'python3';

if (!existsSync(venvPython)) {
  console.warn(
    `[api] No virtualenv at API/.venv, falling back to "${python}".\n` +
      '[api] Set one up with:\n' +
      `[api]   cd API && ${python} -m venv .venv && ` +
      `.venv/${isWindows ? 'Scripts' : 'bin'}/python -m pip install -r requirements.txt`,
  );
}

const runTests = process.argv.includes('--pytest');
const args = runTests ? ['-m', 'pytest', 'tests/', '-q'] : ['app.py'];

const child = spawn(python, args, {
  cwd: apiDir,
  stdio: 'inherit',
  env: { ...process.env, PYTHONUNBUFFERED: '1' },
});

child.on('error', (error) => {
  console.error(`[api] Could not start ${python}: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0));
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
