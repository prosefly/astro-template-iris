import { getCollection, type CollectionEntry } from 'astro:content'

export type Host = CollectionEntry<'hosts'>
export type Guest = CollectionEntry<'guests'>
export type Person = Host | Guest
export type Episode = CollectionEntry<'episodes'> & {
  hosts: Host[]
  guests: Guest[]
}
export type BlogPost = CollectionEntry<'blog'> & { authors: Host[] }

function resolvePeople<Entry extends Person>(
  references: { id: string }[],
  people: Map<string, Entry>,
  entryLabel: string,
  kind: string,
): Entry[] {
  return references.map((reference) => {
    const person = people.get(reference.id)
    if (!person)
      throw new Error(
        `${entryLabel} references an unknown ${kind}: "${reference.id}".`,
      )
    return person
  })
}

export async function getHosts(): Promise<Host[]> {
  const hosts = await getCollection('hosts')
  if (hosts.length === 0)
    throw new Error('Add at least one host YAML file to src/data/hosts/.')
  return hosts
}

export async function getGuests(): Promise<Guest[]> {
  return getCollection('guests')
}

export function personProfileUrl(person: Person) {
  return `/${person.collection}/${person.id}/`
}

export async function getEpisodes(): Promise<Episode[]> {
  const [episodes, hosts, guests] = await Promise.all([
    getCollection('episodes', ({ data }) => !data.draft),
    getHosts(),
    getGuests(),
  ])
  const hostsById = new Map(hosts.map((host) => [host.id, host]))
  const guestsById = new Map(guests.map((guest) => [guest.id, guest]))
  return episodes
    .map((episode) => ({
      ...episode,
      hosts: resolvePeople(
        episode.data.hosts,
        hostsById,
        `Episode "${episode.id}"`,
        'host',
      ),
      guests: resolvePeople(
        episode.data.guests,
        guestsById,
        `Episode "${episode.id}"`,
        'guest',
      ),
    }))
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
}

export function formatNames(people: Person[]) {
  return people.map((person) => person.data.name).join(', ')
}

export async function getPosts(): Promise<BlogPost[]> {
  const [posts, hosts] = await Promise.all([
    getCollection('blog', ({ data }) => !data.draft),
    getHosts(),
  ])
  const hostsById = new Map(hosts.map((host) => [host.id, host]))
  return posts
    .map((post) => ({
      ...post,
      authors: resolvePeople(
        post.data.authors,
        hostsById,
        `Blog post "${post.id}"`,
        'author',
      ),
    }))
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes.toString().padStart(2, '0')}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`
}

export function readingTime(body = '') {
  return `${Math.max(1, Math.ceil(body.split(/\s+/).length / 200))} min read`
}
