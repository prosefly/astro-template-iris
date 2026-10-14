# Podcast RSS

[Back to the overview](../README.md)

The podcast feed is generated at `/podcast.xml`; journal posts have a separate feed at `/rss.xml`. Both use the production domain configured in `src/data/config.ts`.

## Artwork

The website and RSS share one artwork URL: set the show cover with `config.podcast.artwork`, and each episode’s cover with its `artwork` field. Use JPEG or PNG covers in `public/images/` or at public HTTPS URLs. SVG, WebP, and non-HTTPS artwork URLs stop feed generation with a clear error. Covers should be square, 1400–3000 px, RGB, and without an alpha channel. The demo includes 1600 × 1600 PNG covers for the show and all four episodes. SVG originals in `public/artwork/` are editable source assets; regenerate the PNGs after editing them.

The feed provides `itunes:image` and `podcast:image` at both channel and item levels, plus the standard RSS `image` at channel level. All artwork URLs are absolute HTTPS URLs.

The podcast feed resolves relative audio URLs against your production domain and includes enclosures, iTunes metadata, and owner details.

## Show notes and Podcast Namespace

Each episode retains its short description and includes complete HTML show notes in `content:encoded`. Notes use the same Markdown/MDX renderer as the website, preserving lists, links, and component content such as Callouts. The `## Transcript` section is excluded from this HTML; later sections such as references remain included. Links and image URLs are resolved against the episode’s production URL, and scripts and page styling are removed for feed readers.

The feed declares the [Podcast Namespace](https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md) and emits:

- `podcast:person`: all hosts at channel level; the episode’s hosts and guests at item level, with `role="host"` or `role="guest"`, avatar URLs, and profile links from the YAML collections. Per-episode credits fully replace channel credits, so each item includes both roles.
- `podcast:transcript`: the Markdown section headed `## Transcript` automatically becomes a plain-text file at `/transcripts/<episode-id>.txt`. Speaker labels and paragraph breaks are retained; Markdown formatting is removed. The section ends at the next level-one or level-two heading. Missing or empty sections produce no transcript tag or file.
- `podcast:chapters`: existing chapter data generates `/chapters/<episode-id>.json` in the JSON Chapters 1.2.0 format, sorted by start time. Episodes without chapters omit the tag and file.
- `podcast:medium`, `podcast:season`, and `podcast:episode`, alongside the existing iTunes metadata.

Supply a single transcript URL in episode frontmatter:

```yaml
transcript: https://media.example.com/transcripts/your-episode.vtt
```

The type is inferred from the URL pathname: VTT → `text/vtt`, SRT → `application/x-subrip`, TXT → `text/plain`, HTML/HTM → `text/html`, JSON → `application/json`. Suffix matching ignores case, query parameters, and fragments. VTT and SRT automatically use `rel="captions"`; language comes from `config.site.language`. This field accepts only a URL string; arrays and object configurations are not supported. An unknown or missing suffix fails content validation.

For local files, put them in `public/transcripts/` and use a path such as `/transcripts/your-episode.srt`. External URLs must use HTTPS. The file is referenced without fetching or conversion. When `transcript` is omitted, the feed keeps the generated TXT link from the Markdown transcript section. All generated URLs use the production domain from `config.site.url`.

## Before publishing your feed

Replace demo recordings, show identity, and owner contact details with your own. Use publicly reachable HTTPS media URLs and accurate enclosure sizes. Your audio host should support downloads and byte-range requests. Choose an audio format supported by your target podcast directories and inspect the deployed feed before submitting it. The demo platform links are service homepages; replace them with your show’s listings once available.
