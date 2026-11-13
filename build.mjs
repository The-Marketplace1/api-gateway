import { createRequire } from 'module';
const require = createRequire(import.meta.url);
globalThis.require = require;

import * as esbuild from 'esbuild';
import esbuildPluginPino from 'esbuild-plugin-pino';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outdir: 'dist',
  outExtension: { '.js': '.mjs' },
  sourcemap: true,
  plugins: [esbuildPluginPino({ transports: ['pino-pretty'] })],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});
