export interface BlogPost {
  slug: string;
  date: string;
  readTime: number; // minutes
  heroImage: string;
}

export const blogPosts: BlogPost[] = [
  { slug: 'ecommerce-product-image-optimization', date: '2026-03-17', readTime: 6, heroImage: '/blog/ecommerce-images-hero.jpg' },
  { slug: 'avif-vs-webp-next-gen-formats', date: '2026-03-17', readTime: 5, heroImage: '/blog/avif-vs-webp-hero.jpg' },
  { slug: 'batch-compress-images-guide', date: '2026-03-17', readTime: 4, heroImage: '/blog/batch-compress-hero.jpg' },
  { slug: 'how-to-make-youtube-thumbnail', date: '2026-03-17', readTime: 5, heroImage: '/blog/youtube-thumbnail-hero.jpg' },
  { slug: 'best-free-image-editors-2026', date: '2026-03-17', readTime: 6, heroImage: '/blog/best-editors-hero.jpg' },
  { slug: 'how-to-convert-heic-to-jpg', date: '2026-03-17', readTime: 4, heroImage: '/blog/heic-to-jpg-hero.jpg' },
  { slug: 'ai-image-tools-vs-traditional', date: '2026-03-16', readTime: 5, heroImage: '/blog/ai-vs-traditional-hero.jpg' },
  { slug: 'how-to-optimize-images-for-website-speed', date: '2026-03-16', readTime: 6, heroImage: '/blog/optimize-images-hero.jpg' },
  { slug: 'how-to-compress-images-without-losing-quality', date: '2026-03-15', readTime: 5, heroImage: '/blog/compress-images-hero.jpg' },
  { slug: 'jpg-vs-png-vs-webp-which-image-format', date: '2026-03-14', readTime: 6, heroImage: '/blog/image-formats-hero.jpg' },
  { slug: 'how-to-convert-video-to-gif', date: '2026-03-13', readTime: 4, heroImage: '/blog/video-to-gif-hero.jpg' },
  { slug: 'best-image-compression-tools-2026', date: '2026-03-12', readTime: 5, heroImage: '/blog/best-tools-hero.jpg' },
  { slug: 'how-to-remove-image-background-free', date: '2026-03-11', readTime: 4, heroImage: '/blog/remove-bg-hero.jpg' },
  { slug: 'reduce-video-file-size-for-email', date: '2026-03-10', readTime: 5, heroImage: '/blog/reduce-video-hero.jpg' },
  { slug: 'image-sizes-for-social-media-guide', date: '2026-03-09', readTime: 6, heroImage: '/blog/social-media-sizes-hero.jpg' },
  { slug: 'what-is-webp-format-and-why-use-it', date: '2026-03-08', readTime: 4, heroImage: '/blog/webp-format-hero.jpg' },
];
