import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('lib', { recursive: true });
await build({ entryPoints: ['src/host/index.ts'], outfile: 'lib/index.js', bundle: true, platform: 'node', format: 'esm', target: 'node22' });
const result = await build({ entryPoints: ['src/client.tsx'], bundle: true, platform: 'browser', format: 'cjs', target: 'chrome120', write: false, external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'], loader: { '.css': 'text' }, minify: true });
await writeFile('lib/client.js', `window.__ModuleLoader__.load({id:'@layerpx/harness-agent-viewer',factory(require){var module={exports:{}};var exports=module.exports;\n${result.outputFiles[0].text}\nreturn module.exports;}});\n`);
