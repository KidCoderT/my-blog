import { defineConfig } from 'astro/config'
import { unified } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkObsidianImages from './src/remark-obsidian-images.mjs'

export default defineConfig({
  site: 'https://kidcodert.github.io',
  // ponytail: repo is assumed to be "my-blog"; change (or remove for a <user>.github.io repo) if not
  base: '/my-blog',
  compressHTML: true,
  integrations: [sitemap()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath, remarkObsidianImages], rehypePlugins: [rehypeKatex] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } }
  }
})
