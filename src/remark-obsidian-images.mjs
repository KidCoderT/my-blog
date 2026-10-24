// Turns Obsidian embeds `![[file.png]]` / `![[file.png|alt text]]` into normal markdown images,
// so Astro's image pipeline (webp, width/height, base path) picks them up.
// Like Obsidian, files are found by name anywhere under src/content/images/ (subfolders are fine).
// ponytail: assumes posts sit one folder below src/content/ (blog/, notes/); resolve from file.path if you nest folders.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const EMBED = /!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g
const IMAGES = join(process.cwd(), 'src/content/images')

export default function remarkObsidianImages() {
  // filename -> path inside images/. ponytail: if two files share a name the first wins; add path support if that happens.
  const byName = new Map()
  for (const p of readdirSync(IMAGES, { recursive: true })) {
    const rel = String(p).replaceAll('\\', '/')
    const name = rel.split('/').pop()
    if (!byName.has(name)) byName.set(name, rel)
  }

  const walk = (node) => {
    if (!node.children) return
    node.children = node.children.flatMap((child) => {
      if (child.type !== 'text' || !child.value.includes('![[')) return walk(child), child
      const out = []
      let last = 0
      for (const m of child.value.matchAll(EMBED)) {
        if (m.index > last) out.push({ type: 'text', value: child.value.slice(last, m.index) })
        const name = m[1].trim()
        const alt = m[2]?.trim() || name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
        // unknown names fall through unchanged so a typo still fails the build with "image not found"
        out.push({ type: 'image', url: '../images/' + encodeURI(byName.get(name) ?? name), alt })
        last = m.index + m[0].length
      }
      if (last < child.value.length) out.push({ type: 'text', value: child.value.slice(last) })
      return out
    })
  }
  return walk
}
