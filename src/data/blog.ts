export interface BlogPost {
  slug: string;
  date: string;
  readTime: number; // minutes
}

export const blogPosts: BlogPost[] = [
  { slug: 'how-to-compress-images-without-losing-quality', date: '2026-03-15', readTime: 5 },
  { slug: 'jpg-vs-png-vs-webp-which-image-format', date: '2026-03-14', readTime: 6 },
  { slug: 'how-to-convert-video-to-gif', date: '2026-03-13', readTime: 4 },
  { slug: 'best-image-compression-tools-2026', date: '2026-03-12', readTime: 5 },
  { slug: 'how-to-remove-image-background-free', date: '2026-03-11', readTime: 4 },
  { slug: 'reduce-video-file-size-for-email', date: '2026-03-10', readTime: 5 },
  { slug: 'image-sizes-for-social-media-guide', date: '2026-03-09', readTime: 6 },
  { slug: 'what-is-webp-format-and-why-use-it', date: '2026-03-08', readTime: 4 },
];
