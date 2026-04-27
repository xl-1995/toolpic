import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

function* walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const files = [];
for (const f of walk('.open-next')) {
  if (f.includes(`${path.sep}assets${path.sep}`)) continue;
  files.push(f);
}

let total = 0;
const sized = files.map((f) => {
  const sz = gzipSync(fs.readFileSync(f)).length;
  total += sz;
  return [f, sz];
}).sort((a, b) => b[1] - a[1]);

console.log('Top 15 by gz size:');
for (const [f, sz] of sized.slice(0, 15)) {
  console.log(`  ${(sz / 1024).toFixed(0).padStart(5)} KiB  ${f}`);
}
console.log(`Total gz (excl assets): ${(total / 1048576).toFixed(2)} MiB`);
