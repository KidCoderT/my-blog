import rss from '@astrojs/rss'
import { getPosts, postUrl } from '../posts'

export async function GET(context) {
  const posts = await getPosts()
  return rss({
    title: 'KidCoderT',
    description: 'Notes, projects and things I learned.',
    site: new URL(import.meta.env.BASE_URL, context.site),
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      categories: p.data.tags,
      link: postUrl(p),
    })),
  })
}
