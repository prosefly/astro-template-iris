import { z } from 'astro/zod'

export interface Transcript {
  src: string
  type: string
  rel?: 'captions'
}

const formats: Record<string, string> = {
  vtt: 'text/vtt',
  srt: 'application/x-subrip',
  txt: 'text/plain',
  html: 'text/html',
  htm: 'text/html',
  json: 'application/json',
}

export const transcriptSchema = z
  .string()
  .min(1)
  .refine((value) => {
    if (value.startsWith('//')) return false
    try {
      const url = new URL(value, 'https://example.com/')
      return (
        url.protocol === 'https:' &&
        (value.startsWith('/') || value.startsWith('https://'))
      )
    } catch {
      return false
    }
  }, 'Use a local absolute path or a valid HTTPS URL.')
  .transform<Transcript>((src, context) => {
    const pathname = new URL(src, 'https://example.com/').pathname
    const extension = pathname.match(/\.([a-z0-9]+)$/i)?.[1].toLowerCase()
    const type = extension ? formats[extension] : undefined
    if (!type) {
      context.addIssue({
        code: 'custom',
        message:
          'Transcript URL must end in .vtt, .srt, .txt, .html, .htm, or .json.',
      })
      return z.NEVER
    }
    const rel: Transcript['rel'] =
      type === 'text/vtt' || type === 'application/x-subrip'
        ? 'captions'
        : undefined
    return { src, type, ...(rel ? { rel } : {}) }
  })
