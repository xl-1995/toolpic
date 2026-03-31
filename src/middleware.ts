import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

const locales = ['en','zh','ja','ko','es','fr','de','pt','ru','ar','hi','it','tr','vi','th','id','nl','pl','uk','ms'];

// Reverse lookup: slug → toolId (built from tools data)
const slugToToolId: Record<string, string> = {
  // image-compressor
  'image-compressor': 'image-compressor',
  'comprimir-imagen': 'image-compressor',
  'compresseur-image': 'image-compressor',
  'bild-komprimierung': 'image-compressor',
  'compressor-imagem': 'image-compressor',
  'szhatie-izobrazhenij': 'image-compressor',
  'compressore-immagini': 'image-compressor',
  'resim-sikistirma': 'image-compressor',
  'nen-anh': 'image-compressor',
  'kompres-gambar': 'image-compressor',
  'afbeelding-comprimeren': 'image-compressor',
  'kompresja-obrazu': 'image-compressor',
  'stysk-zobrazhen': 'image-compressor',
  'mampat-gambar': 'image-compressor',
  // image-converter
  'image-converter': 'image-converter',
  'convertir-imagen': 'image-converter',
  'convertisseur-image': 'image-converter',
  'bild-konverter': 'image-converter',
  'conversor-imagem': 'image-converter',
  'konverter-izobrazhenij': 'image-converter',
  'convertitore-immagini': 'image-converter',
  'resim-donusturucu': 'image-converter',
  'chuyen-doi-anh': 'image-converter',
  'konversi-gambar': 'image-converter',
  'afbeelding-converter': 'image-converter',
  'konwerter-obrazu': 'image-converter',
  'konverter-zobrazhen': 'image-converter',
  'tukar-format-gambar': 'image-converter',
  // image-crop
  'image-crop': 'image-crop',
  'recortar-imagen': 'image-crop',
  'recadrer-image': 'image-crop',
  'bild-zuschneiden': 'image-crop',
  'cortar-imagem': 'image-crop',
  'obrezka-izobrazhenij': 'image-crop',
  'ritaglio-immagini': 'image-crop',
  'resim-kirpma': 'image-crop',
  'cat-anh': 'image-crop',
  'potong-gambar': 'image-crop',
  'afbeelding-bijsnijden': 'image-crop',
  'przycinanie-obrazu': 'image-crop',
  'obrizka-zobrazhen': 'image-crop',
  // image-watermark
  'image-watermark': 'image-watermark',
  'marca-de-agua': 'image-watermark',
  'filigrane-image': 'image-watermark',
  'bild-wasserzeichen': 'image-watermark',
  'marca-dagua-imagem': 'image-watermark',
  'vodjanoj-znak': 'image-watermark',
  'filigrana-immagini': 'image-watermark',
  'resim-filigran': 'image-watermark',
  'them-watermark': 'image-watermark',
  'watermark-gambar': 'image-watermark',
  'afbeelding-watermerk': 'image-watermark',
  'znak-wodny-obrazu': 'image-watermark',
  'vodjanij-znak': 'image-watermark',
  'tera-air-gambar': 'image-watermark',
  // image-bg-remove
  'remove-background': 'image-bg-remove',
  'eliminar-fondo': 'image-bg-remove',
  'supprimer-arriere-plan': 'image-bg-remove',
  'hintergrund-entfernen': 'image-bg-remove',
  'remover-fundo': 'image-bg-remove',
  'udalit-fon': 'image-bg-remove',
  'rimuovere-sfondo': 'image-bg-remove',
  'arka-plan-kaldir': 'image-bg-remove',
  'xoa-nen-anh': 'image-bg-remove',
  'hapus-latar-belakang': 'image-bg-remove',
  'achtergrond-verwijderen': 'image-bg-remove',
  'usun-tlo': 'image-bg-remove',
  'vydalyty-fon': 'image-bg-remove',
  'buang-latar-belakang': 'image-bg-remove',
  // image-merge
  'image-merge': 'image-merge',
  'unir-imagenes': 'image-merge',
  'fusionner-images': 'image-merge',
  'bilder-zusammenfuegen': 'image-merge',
  'juntar-imagens': 'image-merge',
  'obedinit-izobrazhenija': 'image-merge',
  'unire-immagini': 'image-merge',
  'resim-birlestir': 'image-merge',
  'ghep-anh': 'image-merge',
  'gabung-gambar': 'image-merge',
  'afbeeldingen-samenvoegen': 'image-merge',
  'laczenie-obrazow': 'image-merge',
  'objednannja-zobrazhen': 'image-merge',
  // video-compress
  'video-compressor': 'video-compress',
  'comprimir-video': 'video-compress',
  'compresseur-video': 'video-compress',
  'video-komprimierung': 'video-compress',
  'compressor-video': 'video-compress',
  'szhatie-video': 'video-compress',
  'compressore-video': 'video-compress',
  'video-sikistirma': 'video-compress',
  'nen-video': 'video-compress',
  'kompres-video': 'video-compress',
  'video-comprimeren': 'video-compress',
  'kompresja-wideo': 'video-compress',
  'stysk-video': 'video-compress',
  'mampat-video': 'video-compress',
  // video-convert
  'video-converter': 'video-convert',
  'convertir-video': 'video-convert',
  'convertisseur-video': 'video-convert',
  'video-konverter': 'video-convert',
  'conversor-video': 'video-convert',
  'konverter-video': 'video-convert',
  'convertitore-video': 'video-convert',
  'video-donusturucu': 'video-convert',
  'chuyen-doi-video': 'video-convert',
  'konversi-video': 'video-convert',
  'konwerter-wideo': 'video-convert',
  'tukar-format-video': 'video-convert',
  // video-to-gif
  'video-to-gif': 'video-to-gif',
  'video-a-gif': 'video-to-gif',
  'video-en-gif': 'video-to-gif',
  'video-zu-gif': 'video-to-gif',
  'video-para-gif': 'video-to-gif',
  'video-v-gif': 'video-to-gif',
  'video-in-gif': 'video-to-gif',
  'video-gif-donusturucu': 'video-to-gif',
  'video-sang-gif': 'video-to-gif',
  'video-ke-gif': 'video-to-gif',
  'video-naar-gif': 'video-to-gif',
  'wideo-na-gif': 'video-to-gif',
  'video-u-gif': 'video-to-gif',
  // video-extract-audio
  'extract-audio': 'video-extract-audio',
  'extraer-audio': 'video-extract-audio',
  'extraire-audio': 'video-extract-audio',
  'audio-extrahieren': 'video-extract-audio',
  'extrair-audio': 'video-extract-audio',
  'izvlech-audio': 'video-extract-audio',
  'estrarre-audio': 'video-extract-audio',
  'ses-cikar': 'video-extract-audio',
  'trich-xuat-am-thanh': 'video-extract-audio',
  'ekstrak-audio': 'video-extract-audio',
  'audio-extraheren': 'video-extract-audio',
  'wyodrebnij-dzwiek': 'video-extract-audio',
  'vydobuty-audio': 'video-extract-audio',
};

// toolId → locale → slug (correct slug for each locale)
const toolSlugs: Record<string, Record<string, string>> = {
  'image-compressor': { en:'image-compressor',zh:'image-compressor',ja:'image-compressor',ko:'image-compressor',es:'comprimir-imagen',fr:'compresseur-image',de:'bild-komprimierung',pt:'compressor-imagem',ru:'szhatie-izobrazhenij',ar:'image-compressor',hi:'image-compressor',it:'compressore-immagini',tr:'resim-sikistirma',vi:'nen-anh',th:'image-compressor',id:'kompres-gambar',nl:'afbeelding-comprimeren',pl:'kompresja-obrazu',uk:'stysk-zobrazhen',ms:'mampat-gambar' },
  'image-converter': { en:'image-converter',zh:'image-converter',ja:'image-converter',ko:'image-converter',es:'convertir-imagen',fr:'convertisseur-image',de:'bild-konverter',pt:'conversor-imagem',ru:'konverter-izobrazhenij',ar:'image-converter',hi:'image-converter',it:'convertitore-immagini',tr:'resim-donusturucu',vi:'chuyen-doi-anh',th:'image-converter',id:'konversi-gambar',nl:'afbeelding-converter',pl:'konwerter-obrazu',uk:'konverter-zobrazhen',ms:'tukar-format-gambar' },
  'image-crop': { en:'image-crop',zh:'image-crop',ja:'image-crop',ko:'image-crop',es:'recortar-imagen',fr:'recadrer-image',de:'bild-zuschneiden',pt:'cortar-imagem',ru:'obrezka-izobrazhenij',ar:'image-crop',hi:'image-crop',it:'ritaglio-immagini',tr:'resim-kirpma',vi:'cat-anh',th:'image-crop',id:'potong-gambar',nl:'afbeelding-bijsnijden',pl:'przycinanie-obrazu',uk:'obrizka-zobrazhen',ms:'potong-gambar' },
  'image-watermark': { en:'image-watermark',zh:'image-watermark',ja:'image-watermark',ko:'image-watermark',es:'marca-de-agua',fr:'filigrane-image',de:'bild-wasserzeichen',pt:'marca-dagua-imagem',ru:'vodjanoj-znak',ar:'image-watermark',hi:'image-watermark',it:'filigrana-immagini',tr:'resim-filigran',vi:'them-watermark',th:'image-watermark',id:'watermark-gambar',nl:'afbeelding-watermerk',pl:'znak-wodny-obrazu',uk:'vodjanij-znak',ms:'tera-air-gambar' },
  'image-bg-remove': { en:'remove-background',zh:'remove-background',ja:'remove-background',ko:'remove-background',es:'eliminar-fondo',fr:'supprimer-arriere-plan',de:'hintergrund-entfernen',pt:'remover-fundo',ru:'udalit-fon',ar:'remove-background',hi:'remove-background',it:'rimuovere-sfondo',tr:'arka-plan-kaldir',vi:'xoa-nen-anh',th:'remove-background',id:'hapus-latar-belakang',nl:'achtergrond-verwijderen',pl:'usun-tlo',uk:'vydalyty-fon',ms:'buang-latar-belakang' },
  'image-merge': { en:'image-merge',zh:'image-merge',ja:'image-merge',ko:'image-merge',es:'unir-imagenes',fr:'fusionner-images',de:'bilder-zusammenfuegen',pt:'juntar-imagens',ru:'obedinit-izobrazhenija',ar:'image-merge',hi:'image-merge',it:'unire-immagini',tr:'resim-birlestir',vi:'ghep-anh',th:'image-merge',id:'gabung-gambar',nl:'afbeeldingen-samenvoegen',pl:'laczenie-obrazow',uk:'objednannja-zobrazhen',ms:'gabung-gambar' },
  'video-compress': { en:'video-compressor',zh:'video-compressor',ja:'video-compressor',ko:'video-compressor',es:'comprimir-video',fr:'compresseur-video',de:'video-komprimierung',pt:'compressor-video',ru:'szhatie-video',ar:'video-compressor',hi:'video-compressor',it:'compressore-video',tr:'video-sikistirma',vi:'nen-video',th:'video-compressor',id:'kompres-video',nl:'video-comprimeren',pl:'kompresja-wideo',uk:'stysk-video',ms:'mampat-video' },
  'video-convert': { en:'video-converter',zh:'video-converter',ja:'video-converter',ko:'video-converter',es:'convertir-video',fr:'convertisseur-video',de:'video-konverter',pt:'conversor-video',ru:'konverter-video',ar:'video-converter',hi:'video-converter',it:'convertitore-video',tr:'video-donusturucu',vi:'chuyen-doi-video',th:'video-converter',id:'konversi-video',nl:'video-converter',pl:'konwerter-wideo',uk:'konverter-video',ms:'tukar-format-video' },
  'video-to-gif': { en:'video-to-gif',zh:'video-to-gif',ja:'video-to-gif',ko:'video-to-gif',es:'video-a-gif',fr:'video-en-gif',de:'video-zu-gif',pt:'video-para-gif',ru:'video-v-gif',ar:'video-to-gif',hi:'video-to-gif',it:'video-in-gif',tr:'video-gif-donusturucu',vi:'video-sang-gif',th:'video-to-gif',id:'video-ke-gif',nl:'video-naar-gif',pl:'wideo-na-gif',uk:'video-u-gif',ms:'video-ke-gif' },
  'video-extract-audio': { en:'extract-audio',zh:'extract-audio',ja:'extract-audio',ko:'extract-audio',es:'extraer-audio',fr:'extraire-audio',de:'audio-extrahieren',pt:'extrair-audio',ru:'izvlech-audio',ar:'extract-audio',hi:'extract-audio',it:'estrarre-audio',tr:'ses-cikar',vi:'trich-xuat-am-thanh',th:'extract-audio',id:'ekstrak-audio',nl:'audio-extraheren',pl:'wyodrebnij-dzwiek',uk:'vydobuty-audio',ms:'ekstrak-audio' },
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root path: 301 permanent redirect to /en (instead of next-intl's default 307)
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url, 301);
  }

  // Handle /{locale}/tools/{slug} with wrong slug for locale
  const localeToolMatch = pathname.match(/^\/(en|zh|ja|ko|es|fr|de|pt|ru|ar|hi|it|tr|vi|th|id|nl|pl|uk|ms)\/tools\/([^/]+)$/);
  if (localeToolMatch) {
    const locale = localeToolMatch[1];
    const slug = localeToolMatch[2];
    const toolId = slugToToolId[slug];

    if (toolId) {
      const correctSlug = toolSlugs[toolId]?.[locale];
      if (correctSlug && correctSlug !== slug) {
        // Slug belongs to another locale - redirect to correct slug for this locale
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/tools/${correctSlug}`;
        return NextResponse.redirect(url, 301);
      }
    }
  }

  // Handle /tools/{slug} without locale prefix → redirect to /en/tools/{correct-slug}
  const noLocaleToolMatch = pathname.match(/^\/tools\/([^/]+)$/);
  if (noLocaleToolMatch) {
    const slug = noLocaleToolMatch[1];
    const toolId = slugToToolId[slug];

    if (toolId) {
      const correctSlug = toolSlugs[toolId]?.['en'] || slug;
      const url = request.nextUrl.clone();
      url.pathname = `/en/tools/${correctSlug}`;
      return NextResponse.redirect(url, 301);
    }
  }

  // Handle /blog/{slug} without locale prefix → redirect to /en/blog/{slug}
  const noLocaleBlogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (noLocaleBlogMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/en/blog/${noLocaleBlogMatch[1]}`;
    return NextResponse.redirect(url, 301);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|zh|ja|ko|es|fr|de|pt|ru|ar|hi|it|tr|vi|th|id|nl|pl|uk|ms)/:path*', '/tools/:path*', '/blog/:path*'],
};
