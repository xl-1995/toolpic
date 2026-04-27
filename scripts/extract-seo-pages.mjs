import fs from 'node:fs';

const locales = ['en','zh','ja','ko','es','fr','de','pt','ru','ar','hi','it','tr','vi','th','id','nl','pl','uk','ms'];

for (const locale of locales) {
  const msgPath = `src/messages/${locale}.json`;
  const m = JSON.parse(fs.readFileSync(msgPath, 'utf8'));
  if (!m.seoPages) {
    console.log(`skip ${locale}: no seoPages`);
    continue;
  }
  const sp = m.seoPages;
  const outDir = `src/content/seo-pages`;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/${locale}.json`, JSON.stringify(sp, null, 0) + '\n');
  delete m.seoPages;
  fs.writeFileSync(msgPath, JSON.stringify(m, null, 2) + '\n');
  console.log(`${locale}: extracted ${Object.keys(sp).length} keys → ${outDir}/${locale}.json`);
}
