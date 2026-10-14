export const config = {
  site: {
    name: 'Iris',
    title: 'Iris — A little room for big ideas',
    description:
      'Conversations about making things, finding your own rhythm, and living a little more intentionally. An independent podcast and journal.',
    url: 'https://astro-template-iris.prosefly.dev/',
    language: 'en',
  },
  podcast: {
    // Replace these homepage URLs with your show's listings when available.
    platforms: [
      {
        label: 'Apple Podcasts',
        href: 'https://podcasts.apple.com/',
        icon: 'lucide:podcast',
      },
      {
        label: 'Spotify',
        href: 'https://open.spotify.com/',
        icon: 'lucide:audio-lines',
      },
      {
        label: 'YouTube Music',
        href: 'https://music.youtube.com/',
        icon: 'lucide:play',
      },
      {
        label: 'Pocket Casts',
        href: 'https://pocketcasts.com/',
        icon: 'lucide:headphones',
      },
      { label: 'RSS feed', href: '/podcast.xml', icon: 'lucide:rss' },
    ],
    author: 'Alex Morgan',
    email: 'hello@example.com',
    category: 'Arts',
    explicit: false,
    // Shared by the website and RSS: square JPEG/PNG without transparency.
    artwork: '/images/show.png',
    copyright: 'Alex Morgan',
  },
  content: {
    episodes: { perPage: 12 },
    blog: { perPage: 10 },
  },
  navigation: [
    { label: 'Episodes', href: '/episodes/' },
    { label: 'Journal', href: '/blog/' },
    { label: 'Hosts', href: '/hosts/' },
    { label: 'Guests', href: '/guests/' },
    { label: 'About', href: '/about/' },
  ],
}
