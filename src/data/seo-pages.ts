export interface SeoPage {
  slug: string;
  toolId: string;
  titleKey: string;
  descKey: string;
}

export const seoPages: SeoPage[] = [
  // Image format conversions
  { slug: 'convert-jpg-to-png', toolId: 'image-converter', titleKey: 'convertJpgToPng', descKey: 'convertJpgToPngDesc' },
  { slug: 'convert-jpg-to-webp', toolId: 'image-converter', titleKey: 'convertJpgToWebp', descKey: 'convertJpgToWebpDesc' },
  { slug: 'convert-png-to-jpg', toolId: 'image-converter', titleKey: 'convertPngToJpg', descKey: 'convertPngToJpgDesc' },
  { slug: 'convert-png-to-webp', toolId: 'image-converter', titleKey: 'convertPngToWebp', descKey: 'convertPngToWebpDesc' },
  { slug: 'convert-webp-to-jpg', toolId: 'image-converter', titleKey: 'convertWebpToJpg', descKey: 'convertWebpToJpgDesc' },
  { slug: 'convert-webp-to-png', toolId: 'image-converter', titleKey: 'convertWebpToPng', descKey: 'convertWebpToPngDesc' },
  { slug: 'convert-heic-to-jpg', toolId: 'image-converter', titleKey: 'convertHeicToJpg', descKey: 'convertHeicToJpgDesc' },
  { slug: 'convert-bmp-to-jpg', toolId: 'image-converter', titleKey: 'convertBmpToJpg', descKey: 'convertBmpToJpgDesc' },
  // Video conversions
  { slug: 'convert-mp4-to-webm', toolId: 'video-convert', titleKey: 'convertMp4ToWebm', descKey: 'convertMp4ToWebmDesc' },
  { slug: 'convert-mp4-to-avi', toolId: 'video-convert', titleKey: 'convertMp4ToAvi', descKey: 'convertMp4ToAviDesc' },
  { slug: 'convert-webm-to-mp4', toolId: 'video-convert', titleKey: 'convertWebmToMp4', descKey: 'convertWebmToMp4Desc' },
  { slug: 'convert-mp4-to-gif', toolId: 'video-to-gif', titleKey: 'convertMp4ToGif', descKey: 'convertMp4ToGifDesc' },
  // Compress pages
  { slug: 'compress-jpg', toolId: 'image-compressor', titleKey: 'compressJpg', descKey: 'compressJpgDesc' },
  { slug: 'compress-png', toolId: 'image-compressor', titleKey: 'compressPng', descKey: 'compressPngDesc' },
  { slug: 'compress-webp', toolId: 'image-compressor', titleKey: 'compressWebp', descKey: 'compressWebpDesc' },
  { slug: 'compress-mp4', toolId: 'video-compress', titleKey: 'compressMp4', descKey: 'compressMp4Desc' },
  // Resize for social media
  { slug: 'resize-image-for-instagram', toolId: 'image-crop', titleKey: 'resizeInstagram', descKey: 'resizeInstagramDesc' },
  { slug: 'resize-image-for-facebook', toolId: 'image-crop', titleKey: 'resizeFacebook', descKey: 'resizeFacebookDesc' },
  { slug: 'resize-image-for-twitter', toolId: 'image-crop', titleKey: 'resizeTwitter', descKey: 'resizeTwitterDesc' },
  { slug: 'resize-image-for-youtube-thumbnail', toolId: 'image-crop', titleKey: 'resizeYoutube', descKey: 'resizeYoutubeDesc' },
  // Other tools
  { slug: 'remove-image-background', toolId: 'image-bg-remove', titleKey: 'removeBg', descKey: 'removeBgDesc' },
  { slug: 'add-watermark-to-photo', toolId: 'image-watermark', titleKey: 'addWatermark', descKey: 'addWatermarkDesc' },
  { slug: 'merge-photos-online', toolId: 'image-merge', titleKey: 'mergePhotos', descKey: 'mergePhotosDesc' },
  { slug: 'extract-mp3-from-video', toolId: 'video-extract-audio', titleKey: 'extractMp3', descKey: 'extractMp3Desc' },
  // GPT Image 2 / AI image post-processing
  { slug: 'compress-gpt-image-2-output', toolId: 'image-compressor', titleKey: 'compressGptImage2', descKey: 'compressGptImage2Desc' },
  { slug: 'resize-ai-generated-image', toolId: 'image-crop', titleKey: 'resizeAiImage', descKey: 'resizeAiImageDesc' },
  { slug: 'watermark-ai-generated-image', toolId: 'image-watermark', titleKey: 'watermarkAiImage', descKey: 'watermarkAiImageDesc' },
  { slug: 'remove-background-ai-image', toolId: 'image-bg-remove', titleKey: 'removeBgAiImage', descKey: 'removeBgAiImageDesc' },
  { slug: 'convert-gpt-image-to-jpg', toolId: 'image-converter', titleKey: 'convertGptImageToJpg', descKey: 'convertGptImageToJpgDesc' },
];

export function getSeoPageBySlug(slug: string): SeoPage | undefined {
  return seoPages.find((p) => p.slug === slug);
}
