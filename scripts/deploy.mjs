#!/usr/bin/env node
/**
 * Full deploy pipeline for toolpic on Cloudflare Workers Free tier (3 MiB).
 *
 * Standard OpenNext output is ~3.12 MiB gz = over the limit. Running Terser
 * on handler.mjs and middleware.mjs after build compresses to ~2.60 MiB gz.
 *
 * Steps:
 *   1. Clean .next and .open-next
 *   2. opennextjs-cloudflare build
 *   3. Terser minify the two heavy JS files (handler + middleware)
 *   4. wrangler deploy
 */
import { execSync } from 'node:child_process';
import { rmSync, existsSync, statSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', shell: true, ...opts });
const gzSize = (p) => gzipSync(readFileSync(p)).length;

console.log('▶ 1/4  Cleaning .next and .open-next');
for (const d of ['.next', '.open-next']) {
  if (existsSync(d)) rmSync(d, { recursive: true, force: true });
}

console.log('\n▶ 2/4  opennextjs-cloudflare build');
run('npx opennextjs-cloudflare build');

const TARGETS = [
  '.open-next/server-functions/default/handler.mjs',
  '.open-next/middleware/handler.mjs',
];

console.log('\n▶ 3/4  Terser minify');
let totalBefore = 0, totalAfter = 0;
for (const f of TARGETS) {
  const rawBefore = statSync(f).size;
  const gzBefore = gzSize(f);
  run(`npx terser "${f}" --module --compress --mangle -o "${f}.min"`);
  run(`node -e "require('fs').renameSync('${f}.min', '${f}')"`);
  const rawAfter = statSync(f).size;
  const gzAfter = gzSize(f);
  totalBefore += gzBefore;
  totalAfter += gzAfter;
  console.log(`   ${f}`);
  console.log(`     raw ${(rawBefore / 1024 / 1024).toFixed(2)} → ${(rawAfter / 1024 / 1024).toFixed(2)} MiB`);
  console.log(`     gz  ${(gzBefore / 1024 / 1024).toFixed(2)} → ${(gzAfter / 1024 / 1024).toFixed(2)} MiB`);
}
console.log(`   Combined gz: ${(totalBefore / 1048576).toFixed(2)} → ${(totalAfter / 1048576).toFixed(2)} MiB (limit 3.00)`);
if (totalAfter > 3.0 * 1048576) {
  console.error('\n❌ Combined gz still exceeds 3 MiB. Deploy will fail on CF Free plan.');
  process.exit(1);
}

console.log('\n▶ 4/4  wrangler deploy');
run('npx wrangler deploy');

console.log('\n✓ Deploy complete. Verify at https://toolpic.me');
