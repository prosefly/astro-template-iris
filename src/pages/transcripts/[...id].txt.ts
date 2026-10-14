import type { APIContext, GetStaticPaths } from 'astro'
import { getEpisodes } from '@/lib/content'
import { extractTranscript } from '@/lib/podcast'

export const getStaticPaths: GetStaticPaths = async () => {
  const episodes = await getEpisodes()
  return episodes.flatMap((episode) => {
    const transcript = extractTranscript(episode.body)
    return transcript
      ? [{ params: { id: episode.id }, props: { transcript } }]
      : []
  })
}

export function GET({ props }: APIContext<{ transcript: string }>) {
  return new Response(props.transcript, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
