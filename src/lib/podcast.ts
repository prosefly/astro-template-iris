import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { toString } from 'mdast-util-to-string'
import type { Episode, Person } from './content'
import type { Transcript } from './transcript'

const markdown = unified().use(remarkParse)

export function extractTranscript(body = '') {
  const { children } = markdown.parse(body)
  const start = children.findIndex(
    (node) =>
      node.type === 'heading' &&
      node.depth === 2 &&
      toString(node).trim().toLowerCase() === 'transcript',
  )
  if (start === -1) return undefined
  const blocks: string[] = []
  for (const node of children.slice(start + 1)) {
    if (node.type === 'heading' && node.depth <= 2) break
    const text = toString(node).trim()
    if (text) blocks.push(text)
  }
  return blocks.length > 0 ? blocks.join('\n\n') + '\n' : undefined
}

export function getTranscriptLinks(
  episode: Pick<Episode, 'id' | 'body'> & {
    data: Pick<Episode['data'], 'transcript'>
  },
): Transcript[] {
  if (episode.data.transcript) return [episode.data.transcript]
  if (!extractTranscript(episode.body)) return []
  return [{ src: `/transcripts/${episode.id}.txt`, type: 'text/plain' }]
}

export function escapeXml(value: string) {
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

export function personElement(
  person: Pick<Person, 'id' | 'collection' | 'data'>,
  role: 'host' | 'guest',
  origin: URL,
) {
  const href = escapeXml(
    new URL(`/${person.collection}/${person.id}/`, origin).href,
  )
  const image = person.data.avatar
    ? ` img="${escapeXml(new URL(person.data.avatar, origin).href)}"`
    : ''
  return `<podcast:person role="${role}" group="cast" href="${href}"${image}>${escapeXml(person.data.name)}</podcast:person>`
}

export function artworkElements(src: string, title: string, origin: URL) {
  const url = new URL(src, origin)
  if (url.protocol !== 'https:' || !/\.(jpe?g|png)$/i.test(url.pathname)) {
    throw new Error(
      'RSS artwork for "' +
        title +
        '" must use an HTTPS JPEG or PNG URL. Use the same PNG/JPEG artwork for the website and feed.',
    )
  }
  const href = escapeXml(url.href)
  return (
    '<itunes:image href="' +
    href +
    '"/>\n' +
    '<podcast:image href="' +
    href +
    '" alt="' +
    escapeXml(title) +
    '" aspect-ratio="1/1" purpose="artwork"/>'
  )
}
