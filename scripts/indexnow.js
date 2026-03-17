// Run after deploy: node scripts/indexnow.js
const https = require('https');

const key = '5f7a9b3c2d1e4f6a';
const host = 'toolpic.me';
const locales = ['en','zh','ja','ko','es','fr','de','pt','ru','ar','hi','it','tr','vi','th','id','nl','pl','uk','ms'];

// Generate key URLs
const urls = [];

// Homepages
locales.forEach(l => urls.push(`https://${host}/${l}`));

// Tool pages (just the main 10 English ones - others discovered via hreflang)
const toolSlugs = ['image-compressor','image-converter','image-crop','image-watermark','remove-background','image-merge','video-compressor','video-converter','video-to-gif','extract-audio'];
toolSlugs.forEach(s => urls.push(`https://${host}/en/tools/${s}`));

// Blog pages
const blogSlugs = ['how-to-compress-images-without-losing-quality','jpg-vs-png-vs-webp-which-image-format','how-to-convert-video-to-gif','best-image-compression-tools-2026','how-to-remove-image-background-free','reduce-video-file-size-for-email','image-sizes-for-social-media-guide','what-is-webp-format-and-why-use-it','how-to-convert-heic-to-jpg','ai-image-tools-vs-traditional','how-to-optimize-images-for-website-speed'];
blogSlugs.forEach(s => urls.push(`https://${host}/en/blog/${s}`));

// SEO pages (just English)
const seoSlugs = ['convert-jpg-to-png','convert-jpg-to-webp','convert-png-to-jpg','convert-png-to-webp','convert-webp-to-jpg','convert-webp-to-png','convert-heic-to-jpg','convert-bmp-to-jpg','convert-mp4-to-webm','convert-mp4-to-avi','convert-webm-to-mp4','convert-mp4-to-gif','compress-jpg','compress-png','compress-webp','compress-mp4','resize-image-for-instagram','resize-image-for-facebook','resize-image-for-twitter','resize-image-for-youtube-thumbnail','remove-image-background','add-watermark-to-photo','merge-photos-online','extract-mp3-from-video'];
seoSlugs.forEach(s => urls.push(`https://${host}/en/tools/s/${s}`));

const body = JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls });

const req = https.request({
  hostname: 'api.indexnow.org',
  path: '/indexnow',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
  console.log('IndexNow Status:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});
req.on('error', e => console.error('Error:', e));
req.write(body);
req.end();

console.log(`Submitted ${urls.length} URLs to IndexNow`);
