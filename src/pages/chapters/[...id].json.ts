import type { APIContext, GetStaticPaths } from 'astro'
import { getEpisodes, type Episode } from '@/lib/content'

export const getStaticPaths: GetStaticPaths = async () => {
  const episodes = await getEpisodes()
  return episodes
    .filter((episode) => episode.data.chapters.length > 0)
    .map((episode) => ({
      params: { id: episode.id },
      props: { episode },
    }))
}

export function GET({ props }: APIContext<{ episode: Episode }>) {
  const { episode } = props
  return new Response(
    JSON.stringify({
      version: '1.2.0',
      title: episode.data.title,
      chapters: [...episode.data.chapters]
        .sort((a, b) => a.start - b.start)
        .map((chapter) => ({
          startTime: chapter.start,
          title: chapter.title,
        })),
    }),
    { headers: { 'Content-Type': 'application/json+chapters' } },
  )
}
