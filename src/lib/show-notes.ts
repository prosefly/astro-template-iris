import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import type { RootContent } from 'hast'

const html = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, {
    ...defaultSchema,
    strip: [...(defaultSchema.strip ?? []), 'style'],
  })
  .use(rehypeStringify)

function textContent(node: RootContent): string {
  if (node.type === 'text') return node.value
  return 'children' in node ? node.children.map(textContent).join('') : ''
}

function withoutTranscript<Node extends RootContent>(nodes: Node[]): Node[] {
  const notes: Node[] = []
  let transcriptDepth: number | undefined
  for (const node of nodes) {
    const depth =
      node.type === 'element' && /^h[1-6]$/.test(node.tagName)
        ? Number(node.tagName[1])
        : undefined
    if (transcriptDepth !== undefined) {
      if (depth === undefined || depth > transcriptDepth) continue
      transcriptDepth = undefined
    }
    if (
      depth === 2 &&
      textContent(node).trim().toLowerCase() === 'transcript'
    ) {
      transcriptDepth = depth
      continue
    }
    if (node.type === 'element')
      node.children = withoutTranscript(node.children)
    notes.push(node)
  }
  return notes
}

function resolveLinks(nodes: RootContent[], base: URL) {
  for (const node of nodes) {
    if (node.type !== 'element') continue
    for (const attribute of ['href', 'src']) {
      const value = node.properties[attribute]
      if (typeof value === 'string') {
        node.properties[attribute] = new URL(value, base).href
      }
    }
    resolveLinks(node.children, base)
  }
}

export async function prepareShowNotes(renderedHtml: string, episodeUrl: URL) {
  const tree = html.parse(renderedHtml)
  tree.children = withoutTranscript(tree.children)
  const notes = await html.run(tree)
  resolveLinks(notes.children, episodeUrl)
  return html.stringify(notes)
}
