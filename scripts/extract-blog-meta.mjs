import fs from 'node:fs';
import path from 'node:path';

const locales = ['en','zh','ja','ko','es','fr','de','pt','ru','ar','hi','it','tr','vi','th','id','nl','pl','uk','ms'];

for (const locale of locales) {
  const msgPath = `src/messages/${locale}.json`;
  const m = JSON.parse(fs.readFileSync(msgPath, 'utf8'));
  if (!m.blog?.posts) {
    console.log(`skip ${locale}: no blog.posts`);
    continue;
  }
  const meta = m.blog.posts;
  const outDir = `src/content/blog/${locale}`;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, '_meta.json'), JSON.stringify(meta, null, 0) + '\n');

  delete m.blog.posts;
  fs.writeFileSync(msgPath, JSON.stringify(m, null, 2) + '\n');
  const count = Object.keys(meta).length;
  console.log(`${locale}: extracted ${count} posts → ${outDir}/_meta.json`);
}
