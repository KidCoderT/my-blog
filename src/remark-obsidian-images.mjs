// Turns Obsidian embeds `![[file.png]]` / `![[file.png|alt text]]` into normal markdown images,
// so Astro's image pipeline (webp, width/height, base path) picks them up.
// ponytail: assumes posts sit one folder below src/content/ (blog/, notes/); resolve from file.path if you nest folders.
const EMBED = /!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g

export default function remarkObsidianImages() {
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
        out.push({ type: 'image', url: '../images/' + encodeURI(name), alt })
        last = m.index + m[0].length
      }
      if (last < child.value.length) out.push({ type: 'text', value: child.value.slice(last) })
      return out
    })
  }
  return walk
}
