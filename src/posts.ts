import { execFileSync } from 'node:child_process'
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

/** GoatCounter site (https://<code>.goatcounter.com). Empty string turns analytics and view counts off. */
export const GOATCOUNTER = 'https://kidcodert.goatcounter.com'

/** dd-mm-yyyy (UTC, so the date never shifts with the reader's timezone) */
export const fmtDate = (d: Date) => d.toISOString().slice(0, 10).split('-').reverse().join('-')

/** Repo on GitHub, for "history" links (commit list of a post's file). */
export const REPO = 'https://github.com/KidCoderT/my-blog'

/**
 * Days a post file was committed on, newest first, read from git at build time (one git call per file, cached).
 * %cs = YYYY-MM-DD in the committer's timezone, so a 2am SGT commit doesn't become yesterday in UTC.
 */
const gitDays = new Map<string, Date[]>()
function gitHistory(file: string): Date[] {
  if (!gitDays.has(file)) {
    let days: string[] = []
    try {
      days = execFileSync('git', ['log', '--follow', '--format=%cs', '--', file], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    } catch {} // no git (e.g. built from a zip): no history
    gitDays.set(file, [...new Set(days)].map((d) => new Date(`${d}T00:00:00Z`)))
  }
  return gitDays.get(file)!
}

/** Days a post was edited, newest first. The first commit is "published", not an edit. */
export function edits(p: Post): Date[] {
  if (!p.filePath) return []
  return gitHistory(p.filePath).slice(0, -1).filter((d) => d > p.data.date)
}

/** Last update: manual `updated:` wins, else the newest git edit. */
export const lastUpdated = (p: Post): Date | undefined => p.data.updated ?? edits(p)[0]

/** GitHub commit list (with diffs) for a post's file. */
export const historyUrl = (p: Post) => `${REPO}/commits/master/${p.filePath}`
