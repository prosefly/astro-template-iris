import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { config } from '@/data/config'
import { getPosts } from '@/lib/content'

function escapeXml(value: string) {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[character] ?? character,
  )
}

export async function GET({ site }: APIContext) {
  const posts = await getPosts()
  return rss({
    title: `${config.site.name} journal`,
    description: config.site.description,
    site: site ?? config.site.url,
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/blog/${post.id}/`,
      customData: post.authors
        .map(
          (author) => `<dc:creator>${escapeXml(author.data.name)}</dc:creator>`,
        )
        .join(''),
    })),
  })
}
