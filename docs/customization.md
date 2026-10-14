# Customize Iris

[Back to the overview](../README.md)

Edit `src/data/config.ts` for the show title, description, language, production URL, show-level author, owner email, and artwork. The demo deployment URL is `https://astro-template-iris.prosefly.dev/`. Replace it when using another domain so feeds, canonical links, and the sitemap use that address.

Set `config.podcast.platforms` to the listening links you want to show on the homepage. Each entry has a `label`, `href`, and Prosefly `Icon` name. Add, remove, or reorder entries freely. The demo links point to the homepages of Apple Podcasts, Spotify, YouTube Music, and Pocket Casts, plus the local podcast RSS feed; replace them with your show’s direct listings when available.

Update the visible logo in `Brand.astro` and the show introduction on the homepage and About page to match your show. The homepage reads every host’s name, role, and bio from `src/data/hosts.yaml`. The About page describes the website and show; individual people belong in the Hosts and Guests pages. Customize the theme in `src/styles/token.css`; layout rules remain in `src/styles/global.css`.

The homepage uses the most recently published, non-draft episode. Dates are sorted in descending order; `draft: true` hides content from pages and feeds. Future-dated entries are not automatically scheduled: keep them as drafts until you’re ready to rebuild and publish.

## Theme tokens

`src/styles/token.css` is the theme entry point, imported by `global.css`. Typography, spacing, colors, and Prosefly aliases are configured together.

| Tokens                                                                            | Customize                                                                        |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `--color-*`                                                                       | Page, text, accent, surfaces, borders, selection, hover, and player track colors |
| `--font-*`, `--text-*`, `--weight-*`, `--line-height-*`, `--tracking-*`           | Font families, text sizes, weights, line heights, and letter spacing             |
| `--space-*`, `--section-spacing`, `--hero-*`, `--card-padding`, `--panel-padding` | Shared spacing and section/component density                                     |
| `--width-*`, `--page-gutter`                                                      | Site width, reading width, detail widths, and page margins                       |
| `--radius-*`, `--focus-ring-*`, `--motion-*`                                      | Corners, keyboard focus, and animation timing                                    |
| `--player-*`, `--pf-*`                                                            | Audio player settings and Prosefly component aliases                             |

Change `--color-accent` once to update links, active states, focus outlines, badges, callouts, and playback progress. Shared spacing uses a 4px scale: for example, `--space-6` is 24px. Component-specific values such as `--card-padding` reference that scale and can be changed independently.

The end of `token.css` contains responsive values at 1000px and 700px, single-column episode cards at 560px, plus the wide-screen hero gap at 1400px. Update these alongside desktop values when customizing titles or margins. Structural breakpoints stay literal in CSS because custom properties do not work inside media-query conditions. One-off optical adjustments and layout structure remain in their owning styles.

Long-form reading uses `--text-prose` independently of UI text: 17px on desktop and 16px on mobile, with `--line-height-prose` set to 1.75. Metadata uses 12–13px and navigation uses 14px. Font sizes use `rem` so they follow the reader’s default font size. Adjust `--text-subsection-title` for mobile section headings and `--episode-grid-columns` for the episode grid.

When changing font families, update the Fontsource imports at the top of `global.css` as well. Artwork and the HTML theme-color metadata are separate assets/settings and do not inherit CSS tokens.

## Pagination

Set `config.content.episodes.perPage` (default 12) and `config.content.blog.perPage` (default 10) to positive integers. The first archive pages live at `/episodes/` and `/blog/`; subsequent pages use `/episodes/page/2/` and `/blog/page/2/`. Previous/next links and page-specific canonical URLs are rendered statically, and feeds continue to include all published entries.

Episode filters and search cover the full catalog, with results paginated at the same page size. The search index uses inert HTML templates so searching does not require a service or network request. Without JavaScript, the static archive pagination still works. The current demo has fewer entries than the default page sizes, so pagination controls appear after you add more content or lower those settings.

## Deployment

Set `config.site.url` to your public HTTPS domain before building. Astro’s site URL, canonical links, sitemap, and feed media links all use this setting.

Run `npm run check` and `npm run build`, then deploy `dist/` to a static host. This repository includes a GitHub Pages workflow in [`.github/workflows/site.yml`](../.github/workflows/site.yml). Enable Pages with GitHub Actions in your repository settings when using that workflow. For a project hosted under a subpath rather than a custom domain, adapt Astro’s base path and the template’s root-relative links before deploying.

Prosefly’s Icon integration fetches and caches Iconify data during a clean build, so initial builds require internet access. Generated icons and Fontsource fonts are served by the finished static site. Audio files are loaded from the URLs in each episode’s frontmatter; the demo uses externally hosted recordings.
