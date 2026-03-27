export interface BlogPost {
  slug: string;
  date: string;
  readTime: number; // minutes
  heroImage: string;
  relatedToolIds: string[]; // tool IDs this blog post is related to
}

export const blogPosts: BlogPost[] = [
  { slug: 'best-mp4-to-gif-converters-2026', date: '2026-03-24', readTime: 5, heroImage: '/blog/best-gif-converters-hero.jpg', relatedToolIds: ['video-to-gif'] },
  { slug: 'how-to-create-perfect-gif-from-video', date: '2026-03-24', readTime: 5, heroImage: '/blog/perfect-gif-hero.jpg', relatedToolIds: ['video-to-gif', 'video-compress'] },
  { slug: 'compress-images-for-email-guide', date: '2026-03-24', readTime: 4, heroImage: '/blog/compress-email-hero.jpg', relatedToolIds: ['image-compressor'] },
  { slug: 'free-online-photo-editor-no-signup', date: '2026-03-24', readTime: 5, heroImage: '/blog/no-signup-editor-hero.jpg', relatedToolIds: ['image-crop', 'image-compressor', 'image-converter'] },
  { slug: 'how-to-merge-photos-into-collage', date: '2026-03-24', readTime: 4, heroImage: '/blog/merge-collage-hero.jpg', relatedToolIds: ['image-merge'] },
  { slug: 'how-to-resize-image-without-losing-quality', date: '2026-03-19', readTime: 5, heroImage: '/blog/resize-quality-hero.jpg', relatedToolIds: ['image-crop'] },
  { slug: 'linkedin-image-sizes-guide', date: '2026-03-19', readTime: 4, heroImage: '/blog/linkedin-sizes-hero.jpg', relatedToolIds: ['image-crop', 'image-compressor'] },
  { slug: 'how-to-remove-watermark-from-photo', date: '2026-03-19', readTime: 5, heroImage: '/blog/watermark-ethics-hero.jpg', relatedToolIds: ['image-watermark'] },
  { slug: 'gif-vs-video-which-to-use', date: '2026-03-19', readTime: 5, heroImage: '/blog/gif-vs-video-hero.jpg', relatedToolIds: ['video-to-gif', 'video-compress'] },
  { slug: 'how-to-extract-audio-from-youtube-video', date: '2026-03-19', readTime: 4, heroImage: '/blog/extract-audio-guide-hero.jpg', relatedToolIds: ['video-extract-audio'] },
  { slug: 'how-to-create-instagram-carousel', date: '2026-03-18', readTime: 5, heroImage: '/blog/instagram-carousel-hero.jpg', relatedToolIds: ['image-crop', 'image-merge'] },
  { slug: 'png-transparent-background-guide', date: '2026-03-18', readTime: 4, heroImage: '/blog/png-transparent-hero.jpg', relatedToolIds: ['image-bg-remove', 'image-converter'] },
  { slug: 'how-to-compress-video-for-whatsapp', date: '2026-03-18', readTime: 4, heroImage: '/blog/compress-whatsapp-hero.jpg', relatedToolIds: ['video-compress'] },
  { slug: 'free-watermark-generator-guide', date: '2026-03-18', readTime: 5, heroImage: '/blog/watermark-guide-hero.jpg', relatedToolIds: ['image-watermark'] },
  { slug: 'tiktok-video-format-guide', date: '2026-03-18', readTime: 5, heroImage: '/blog/tiktok-format-hero.jpg', relatedToolIds: ['video-convert', 'image-crop'] },
  { slug: 'ecommerce-product-image-optimization', date: '2026-03-17', readTime: 6, heroImage: '/blog/ecommerce-images-hero.jpg', relatedToolIds: ['image-compressor', 'image-crop'] },
  { slug: 'avif-vs-webp-next-gen-formats', date: '2026-03-17', readTime: 5, heroImage: '/blog/avif-vs-webp-hero.jpg', relatedToolIds: ['image-converter'] },
  { slug: 'batch-compress-images-guide', date: '2026-03-17', readTime: 4, heroImage: '/blog/batch-compress-hero.jpg', relatedToolIds: ['image-compressor'] },
  { slug: 'how-to-make-youtube-thumbnail', date: '2026-03-17', readTime: 5, heroImage: '/blog/youtube-thumbnail-hero.jpg', relatedToolIds: ['image-crop', 'image-watermark'] },
  { slug: 'best-free-image-editors-2026', date: '2026-03-17', readTime: 6, heroImage: '/blog/best-editors-hero.jpg', relatedToolIds: ['image-compressor', 'image-converter'] },
  { slug: 'how-to-convert-heic-to-jpg', date: '2026-03-17', readTime: 4, heroImage: '/blog/heic-to-jpg-hero.jpg', relatedToolIds: ['image-converter'] },
  { slug: 'ai-image-tools-vs-traditional', date: '2026-03-16', readTime: 5, heroImage: '/blog/ai-vs-traditional-hero.jpg', relatedToolIds: ['image-bg-remove'] },
  { slug: 'how-to-optimize-images-for-website-speed', date: '2026-03-16', readTime: 6, heroImage: '/blog/optimize-images-hero.jpg', relatedToolIds: ['image-compressor', 'image-converter'] },
  { slug: 'how-to-compress-images-without-losing-quality', date: '2026-03-15', readTime: 5, heroImage: '/blog/compress-images-hero.jpg', relatedToolIds: ['image-compressor'] },
  { slug: 'jpg-vs-png-vs-webp-which-image-format', date: '2026-03-14', readTime: 6, heroImage: '/blog/image-formats-hero.jpg', relatedToolIds: ['image-converter'] },
  { slug: 'how-to-convert-video-to-gif', date: '2026-03-13', readTime: 4, heroImage: '/blog/video-to-gif-hero.jpg', relatedToolIds: ['video-to-gif'] },
  { slug: 'best-image-compression-tools-2026', date: '2026-03-12', readTime: 5, heroImage: '/blog/best-tools-hero.jpg', relatedToolIds: ['image-compressor'] },
  { slug: 'how-to-remove-image-background-free', date: '2026-03-11', readTime: 4, heroImage: '/blog/remove-bg-hero.jpg', relatedToolIds: ['image-bg-remove'] },
  { slug: 'reduce-video-file-size-for-email', date: '2026-03-10', readTime: 5, heroImage: '/blog/reduce-video-hero.jpg', relatedToolIds: ['video-compress'] },
  { slug: 'image-sizes-for-social-media-guide', date: '2026-03-09', readTime: 6, heroImage: '/blog/social-media-sizes-hero.jpg', relatedToolIds: ['image-crop'] },
  { slug: 'what-is-webp-format-and-why-use-it', date: '2026-03-08', readTime: 4, heroImage: '/blog/webp-format-hero.jpg', relatedToolIds: ['image-converter'] },
];

/** Get blog posts related to a specific tool (reverse lookup) */
export function getBlogPostsForTool(toolId: string, limit = 4): BlogPost[] {
  return blogPosts
    .filter((post) => post.relatedToolIds.includes(toolId))
    .slice(0, limit);
}
