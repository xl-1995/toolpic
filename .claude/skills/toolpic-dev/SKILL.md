# ToolPic 开发与 SEO 完整流程

快速开发新工具、写博客文章、做 SEO 优化并部署上线的完整工作流。

## 核心原则

1. **多语言同步** — 任何新增内容必须同时完成 20 种语言翻译，绝不只做一种语言
2. **OG 图片规范** — 所有 OG 图片 < 200KB，用 `nano-banana-pro --size 1K --aspect-ratio 16:9` 生成
3. **SEO 优先** — 每个页面都需要完整的 meta tags、JSON-LD、hreflang
4. **博客配图** — 每篇文章需要 hero 图片和独立 OG 图片
5. **热点驱动** — 写文章和开发工具要追踪热点需求

---

## 一、新增工具 完整流程

### Step 1: 开发工具组件
```
src/components/tools/NewTool.tsx
```
- `'use client'` 指令
- 使用 `DropZone` 组件上传文件
- 使用 `useTranslations('common')` 获取通用翻译
- 100% 浏览器端处理，不上传服务器
- 参考 `ImageCompressor.tsx` 的模式

### Step 2: 注册工具
1. `src/data/tools.ts` — 添加工具定义（id, category, icon, 20 语言的 localized slugs）
2. `src/app/[locale]/tools/[slug]/ToolPageClient.tsx` — 导入并注册到 `toolComponents` map

### Step 3: 添加 20 语言翻译
在 `src/messages/{locale}.json` 的 `tools` 对象中添加：
```json
"new-tool-id": {
  "title": "...",
  "description": "...",
  "h1": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "howToUseTitle": "...",
  "step1Title": "...", "step1Desc": "...",
  "step2Title": "...", "step2Desc": "...",
  "step3Title": "...", "step3Desc": "...",
  "featuresTitle": "...",
  "feature1Title": "...", "feature1Desc": "...",
  "feature2Title": "...", "feature2Desc": "...",
  "feature3Title": "...", "feature3Desc": "...",
  "feature4Title": "...", "feature4Desc": "...",
  "faqTitle": "...",
  "faq1Q": "...", "faq1A": "...",
  "faq2Q": "...", "faq2A": "...",
  "faq3Q": "...", "faq3A": "..."
}
```
**必须同时更新所有 20 个语言文件！** 用并行 Agent 分组翻译。

### Step 4: 生成工具效果图（可选）
```bash
python .claude/skills/nano-banana-pro/scripts/generate_image.py \
  -p "描述工具效果的图片" \
  -o public/tools/new-tool-preview.png \
  -a 16:9 -s 1K
```

### Step 5: 构建部署
```bash
rm -rf .next .open-next
npx opennextjs-cloudflare build
npx wrangler deploy
```

### Step 6: 提交 Google Search Console
重新提交 sitemap.xml（新工具页会自动包含在 sitemap 中）

---

## 二、新增博客文章 完整流程

### Step 1: 选题（追踪热点）
- 检查 Google Trends 当前热门搜索
- 分析竞品博客热门文章
- 关注新图片/视频格式（如 AVIF, AV1）
- 关注社交媒体新尺寸规范变化

### Step 2: 注册文章
`src/data/blog.ts` 添加：
```ts
{ slug: 'article-slug', date: '2026-03-16', readTime: 5 }
```

### Step 3: 写文章内容（20 语言）
在每个 `src/messages/{locale}.json` 的 `blog.posts` 中添加：
```json
"article-slug": {
  "title": "文章标题",
  "metaTitle": "SEO 标题 | ToolPic Blog",
  "metaDescription": "SEO 描述 150-160 字符",
  "excerpt": "1-2 句摘要",
  "content": [
    { "heading": "章节标题", "text": "章节内容 2-3 段" },
    { "heading": "...", "text": "..." },
    { "heading": "...", "text": "..." },
    { "heading": "使用 ToolPic 的方法", "text": "引导到工具的步骤" }
  ],
  "relatedToolIds": "tool-id-1,tool-id-2"
}
```

### Step 4: 生成文章配图
```bash
# Hero 图片
python .claude/skills/nano-banana-pro/scripts/generate_image.py \
  -p "描述文章主题的插图" \
  -o public/blog/article-slug-hero.png \
  -a 16:9 -s 1K

# 独立 OG 图片（如需）
python .claude/skills/nano-banana-pro/scripts/generate_image.py \
  -p "文章标题的社交分享卡片" \
  -o public/blog/article-slug-og.png \
  -a 16:9 -s 1K
```

**图片大小要求：** < 200KB，Google 推荐 OG 图片 1200x630

### Step 5: 构建部署 + 提交 GSC

---

## 三、程序化 SEO 页面

### 添加新的长尾关键词页面
1. `src/data/seo-pages.ts` — 添加 `{ slug, toolId, titleKey, descKey }`
2. `src/messages/en.json` `seoPages` 命名空间添加标题和描述
3. 翻译到其他语言
4. 构建部署

### 常见长尾关键词模式
- `convert {format1} to {format2}` — 格式转换
- `compress {format}` — 压缩特定格式
- `resize image for {platform}` — 社交媒体裁剪
- `{tool} online free` — 免费在线工具

---

## 四、SEO 检查清单（每次部署后）

### 必查项
- [ ] 所有页面返回 200（不是 404）
- [ ] Title 标签唯一且含关键词
- [ ] Meta description 150-160 字符
- [ ] Canonical URL 正确
- [ ] Hreflang 21 个（20语言 + x-default）
- [ ] OG tags 完整（title/desc/image/url）
- [ ] JSON-LD 存在（WebApplication/FAQPage/BreadcrumbList）
- [ ] SEO 内容渲染（How to/Features/FAQ）
- [ ] 语言切换器正常工作
- [ ] Sitemap 包含所有新页面

### Google 标准
- OG 图片: 1200x630px, < 200KB
- Favicon: 至少 48x48px
- 页面加载: < 3秒
- 移动端友好

---

## 五、OG 图片生成规范

```bash
# 网站通用 OG 图片
python .claude/skills/nano-banana-pro/scripts/generate_image.py \
  -p "Professional card for ToolPic, dark bg #09090b, purple-blue gradient text, modern tech" \
  -o public/og-image.png -a 16:9 -s 1K

# 博客文章 OG 图片
python .claude/skills/nano-banana-pro/scripts/generate_image.py \
  -p "文章主题相关的插图描述" \
  -o public/blog/{slug}-og.png -a 16:9 -s 1K

# 工具页 OG 图片
python .claude/skills/nano-banana-pro/scripts/generate_image.py \
  -p "工具功能的可视化展示" \
  -o public/tools/{tool-id}-og.png -a 16:9 -s 1K
```

**关键参数:** 始终用 `--size 1K`（不是 2K），确保 < 200KB。如果超过，降低质量或简化 prompt。

---

## 六、技术注意事项

### OpenNext + Cloudflare Workers
- `localePrefix` 必须用 `'always'`，不能用 `'as-needed'`
- Windows 构建有兼容性警告但可以工作
- RSC 数据请求可能返回 HTML 导致水合失败
- 语言切换器用原生 `<select>` 而非 React 自定义下拉菜单（更可靠）

### 翻译效率
- 用并行 Agent 分组翻译（4-5 组 × 4-5 语言）
- 翻译完成后 `npx tsc --noEmit` 检查类型
- 构建前确保所有 JSON 文件语法正确

### wrangler.toml
- 必须包含 `account_id`（多账号时需要指定）

---

## 七、热点工具快速上线流程

当发现热点需求时（如新格式支持、新平台尺寸）：

1. **评估** — 是否属于图片/视频处理范畴？能否浏览器端实现？
2. **开发** — 创建工具组件（参考现有模式）
3. **翻译** — 并行翻译 20 语言（工具名/描述/SEO内容/FAQ）
4. **配图** — nano-banana-pro 生成工具展示图和 OG 图片
5. **SEO** — 创建对应的程序化着陆页
6. **博客** — 写一篇相关教程文章（20语言）
7. **部署** — 构建 + 部署 + 提交 GSC
8. **推广** — 社交媒体发布

整个流程可以在 2-3 小时内完成。
