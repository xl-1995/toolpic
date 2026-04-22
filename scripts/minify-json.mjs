#!/usr/bin/env node
// Resave all JSON under src/messages and src/content with no indentation.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (p.endsWith('.json')) yield p;
  }
}

let totalBefore = 0, totalAfter = 0, files = 0;
for (const dir of ['src/messages', 'src/content']) {
  for (const p of walk(dir)) {
    const raw = readFileSync(p, 'utf-8');
    const minified = JSON.stringify(JSON.parse(raw));
    totalBefore += Buffer.byteLength(raw);
    totalAfter += Buffer.byteLength(minified);
    writeFileSync(p, minified, 'utf-8');
    files++;
  }
}
console.log(`Files: ${files}`);
console.log(`Before: ${(totalBefore/1024).toFixed(1)} KiB`);
console.log(`After:  ${(totalAfter/1024).toFixed(1)} KiB`);
console.log(`Saved:  ${((totalBefore-totalAfter)/1024).toFixed(1)} KiB (${((1-totalAfter/totalBefore)*100).toFixed(1)}%)`);
