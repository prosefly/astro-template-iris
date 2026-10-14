import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import proseflyComponents from '@prosefly/astro-components/integration'
import { defineConfig } from 'astro/config'
import { config } from './src/data/config.ts'

export default defineConfig({
  site: config.site.url,
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [
    proseflyComponents({
      icons: {
        preload: [
          'lucide:arrow-up-right',
          'lucide:arrow-right',
          'lucide:arrow-left',
          'lucide:headphones',
          'lucide:play',
          'lucide:rss',
          'ri:replay-15-line',
          'ri:play-fill',
          'ri:pause-fill',
          'ri:forward-30-line',
          'ri:volume-up-fill',
          'ri:volume-mute-fill',
        ],
      },
    }),
    mdx(),
    sitemap(),
  ],
})
