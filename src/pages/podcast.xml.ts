import rss from '@astrojs/rss'
import { render } from 'astro:content'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { loadRenderers } from 'astro:container'
import { getContainerRenderer } from '@astrojs/mdx/container-renderer'
import { prepareShowNotes } from '@/lib/show-notes'
import type { APIContext } from 'astro'
import { config } from '@/data/config'
import { getEpisodes, getHosts, formatNames } from '@/lib/content'
import {
  escapeXml,
  getTranscriptLinks,
  personElement,
  artworkElements,
} from '@/lib/podcast'

export async function GET({ site }: APIContext) {
  const origin = site ?? new URL(config.site.url)
  const [episodes, hosts] = await Promise.all([getEpisodes(), getHosts()])
  const renderers = await loadRenderers([getContainerRenderer()])
  const container = await AstroContainer.create({ renderers })
  const absolute = (path: string) => escapeXml(new URL(path, origin).href)
  return rss({
    title: config.site.name,
    description: config.site.description,
    site: origin,
    xmlns: {
      itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd',
      atom: 'http://www.w3.org/2005/Atom',
      podcast: 'https://podcastindex.org/namespace/1.0',
      content: 'http://purl.org/rss/1.0/modules/content/',
    },
    customData: [
      `<language>${escapeXml(config.site.language)}</language>`,
      `<copyright>${escapeXml(config.podcast.copyright)}</copyright>`,
      `<atom:link href="${absolute('/podcast.xml')}" rel="self" type="application/rss+xml"/>`,
      '<itunes:type>episodic</itunes:type>',
      `<itunes:author>${escapeXml(config.podcast.author)}</itunes:author>`,
      `<itunes:owner><itunes:name>${escapeXml(config.podcast.author)}</itunes:name><itunes:email>${escapeXml(config.podcast.email)}</itunes:email></itunes:owner>`,
      `<itunes:explicit>${config.podcast.explicit}</itunes:explicit>`,
      `<itunes:category text="${escapeXml(config.podcast.category)}"/>`,
      artworkElements(config.podcast.artwork, config.site.name, origin),
      `<image><url>${absolute(config.podcast.artwork)}</url><title>${escapeXml(config.site.name)}</title><link>${absolute('/')}</link><width>144</width><height>144</height></image>`,
      '<podcast:medium>podcast</podcast:medium>',
      ...hosts.map((host) => personElement(host, 'host', origin)),
    ].join('\n'),
    items: await Promise.all(
      episodes.map(async (episode) => {
        const episodeUrl = new URL('/episodes/' + episode.id + '/', origin)
        const { Content } = await render(episode)
        const renderedHtml = await container.renderToString(Content, {
          request: new Request(episodeUrl),
        })
        return {
          title: episode.data.title,
          description: episode.data.description,
          content: await prepareShowNotes(renderedHtml, episodeUrl),
          pubDate: episode.data.publishedAt,
          link: `/episodes/${episode.id}/`,
          enclosure: {
            url: new URL(episode.data.audio.src, origin).href,
            length: episode.data.audio.size,
            type: episode.data.audio.type,
          },
          customData: [
            artworkElements(episode.data.artwork, episode.data.title, origin),
            `<itunes:author>${escapeXml(formatNames(episode.hosts))}</itunes:author>`,
            `<itunes:duration>${Math.round(episode.data.audio.duration)}</itunes:duration>`,
            `<itunes:episode>${episode.data.number}</itunes:episode>`,
            `<itunes:season>${episode.data.season}</itunes:season>`,
            '<itunes:episodeType>full</itunes:episodeType>',
            `<itunes:explicit>${config.podcast.explicit}</itunes:explicit>`,
            `<podcast:episode>${episode.data.number}</podcast:episode>`,
            `<podcast:season>${episode.data.season}</podcast:season>`,
            // Item-level credits replace channel credits, so include hosts as well as guests.
            ...episode.hosts.map((host) => personElement(host, 'host', origin)),
            ...episode.guests.map((guest) =>
              personElement(guest, 'guest', origin),
            ),
            ...getTranscriptLinks(episode).map((transcript) => {
              const language = config.site.language
              const rel =
                'rel' in transcript && transcript.rel
                  ? ` rel="${escapeXml(transcript.rel)}"`
                  : ''
              return `<podcast:transcript url="${absolute(transcript.src)}" type="${escapeXml(transcript.type)}" language="${escapeXml(language)}"${rel}/>`
            }),
            ...(episode.data.chapters.length > 0
              ? [
                  `<podcast:chapters url="${absolute(`/chapters/${episode.id}.json`)}" type="application/json+chapters"/>`,
                ]
              : []),
          ].join('\n'),
        }
      }),
    ),
  })
}
