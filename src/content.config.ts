import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'

/** Frontmatter dates are written dd-mm-yyyy, e.g. `date: 23-10-2026`. */
const ddmmyyyy = z
  .string({ error: 'Use dd-mm-yyyy, e.g. 23-10-2026' })
  .regex(/^\d{2}-\d{2}-\d{4}$/, 'Use dd-mm-yyyy, e.g. 23-10-2026')
  .transform((s, ctx) => {
    const [d, m, y] = s.split('-')
    const date = new Date(`${y}-${m}-${d}T00:00:00Z`)
    // reject impossible dates like 31-02-2026 (JS would silently roll them into March)
    if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== `${y}-${m}-${d}`) {
      ctx.addIssue({ code: 'custom', message: `${s} is not a real date` })
      return z.NEVER
    }
    return date
  })

// Blogs and notes share one frontmatter shape; each folder is its own collection (and URL section).
const schema = z.object({
  title: z.string(),
  description: z.string(),
  date: ddmmyyyy,
  updated: ddmmyyyy.optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false)
})

const blog = defineCollection({ loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }), schema })
const notes = defineCollection({ loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }), schema })

export const collections = { blog, notes }
