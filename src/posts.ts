import { getCollection, type CollectionEntry } from 'astro:content'

export type Kind = 'blog' | 'notes'
export type Post = CollectionEntry<Kind>
export const KINDS: Kind[] = ['blog', 'notes']

/** All published posts, newest first. No `kind` = blogs and notes merged (home, timeline, tags, RSS). */
export async function getPosts(kind?: Kind): Promise<Post[]> {
  const lists = await Promise.all((kind ? [kind] : KINDS).map((k) => getCollection(k, (p) => !p.data.draft)))
  return lists.flat().sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

/** Prefix a site path with the deploy base ("/my-blog/"). Every internal href goes through this. */
export const url = (path = '') => import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '')

export const postUrl = (p: Post) => url(`${p.collection}/${p.id}/`)
export const tagUrl = (tag: string) => url(`tags/${encodeURIComponent(tag)}/`)

/** view-transition-name only allows ident chars; post ids can contain "/". Collection keeps blog/x and notes/x distinct. */
export const vtName = (p: Post) => `post-${p.collection}-` + p.id.replace(/[^A-Za-z0-9_-]/g, '-')

/** dd-mm-yyyy (UTC, so the date never shifts with the reader's timezone) */
export const fmtDate = (d: Date) => d.toISOString().slice(0, 10).split('-').reverse().join('-')
