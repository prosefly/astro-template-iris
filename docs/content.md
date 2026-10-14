# Content guide

[Back to the overview](../README.md)

## Publishing and drafts

Set `draft: true` in an episode or journal post to exclude it from pages and feeds. Published entries are sorted by `publishedAt`, newest first; the newest non-draft episode is featured on the homepage. Future dates do not schedule publication automatically. Keep an entry as a draft until you are ready to rebuild and deploy.

## Hosts and guests

Define each person in a separate YAML file under `src/data/hosts/` or `src/data/guests/`. Astro loads both directories as content collections. For example, create `src/data/guests/your-guest.yaml`:

```yaml
name: Your Guest
role: Writer & maker
bio: A short introduction to their work and interests.
avatar: /people/your-guest.jpg
links:
  - label: Website
    url: https://example.com/
```

`name`, `role`, and `bio` are required. The filename without `.yaml` supplies the person ID, so `your-guest.yaml` is referenced as `your-guest`; no `id` property is needed. `avatar` and `links` are optional; initials appear when no portrait is supplied. The demo people are fictional, with locally served portraits generated with AI. Their prompts are recorded in `scripts/avatar-prompts.json`. Use lowercase hyphenated filenames and keep them stable to preserve references and profile URLs.

Episodes reference `hosts` and `guests` by ID. At least one host is required. Guests are optional, so a solo episode can use `guests: []`. Both fields support multiple people, preserving their order. Unknown referenced IDs stop the build. Updating a person updates their episode bios, card bylines, player metadata, and archive search without editing each episode. The homepage and Hosts directory read host profiles directly from `src/data/hosts/`. The Guests directory reads `src/data/guests/`. Both directories link to individual profiles generated at `/hosts/<id>/` and `/guests/<id>/`. Host profiles show up to six recent hosted episodes and three authored journal posts; guest profiles show up to six recent appearances. Only published, non-draft contributions are shown, with links to the full archives. Episode and article bylines link to the appropriate profile. The feed’s show-level author remains in `config.podcast.author`; episode author metadata uses the associated hosts.

## Add an episode

Create `src/content/episodes/your-episode.mdx`:

```mdx
---
title: 'A conversation worth keeping'
description: 'A short introduction to this conversation.'
publishedAt: 2026-10-14
category: Creativity
number: 5
season: 1
hosts:
  - alex-morgan
guests:
  - your-guest
artwork: /images/your-episode.png
audio:
  src: /audio/your-episode.mp3
  type: audio/mpeg
  size: 12345678 # bytes
  duration: '40:00' # MM:SS; HH:MM:SS or numeric seconds also work
chapters:
  - title: Getting started
    start: '00:00'
  - title: Finding a practice
    start: '10:20'
---

import { Callout } from '@prosefly/astro-components'

## The conversation

Write show notes in Markdown here.

<Callout type="tip" title="One thing to try">
  A small practice to take into your day.
</Callout>

## Transcript

**Host:** Add an accurate transcript of your recording.
```

Put audio files in `public/audio/`, SVG originals in `public/artwork/`, and PNG/JPEG covers in `public/images/`, or use absolute HTTPS URLs for hosted media. `audio.size` is the actual audio file size in bytes (a positive integer). `audio.duration` accepts positive numeric seconds or quoted timestamps such as `"00:53"` (MM:SS) and `"01:20:30"` (HH:MM:SS). Fractional seconds are supported, for example `"00:53.019"`. Seconds must be below 60; minutes must also be below 60 when an hour field is present. A two-part timestamp may use total minutes, such as `"80:30"`. Content loading validates and normalizes every format to numeric seconds. RSS maps these fields to enclosure `length` and `itunes:duration`; the player uses the same duration. Chapter `start` accepts the same numeric or quoted MM:SS / HH:MM:SS formats, including fractional seconds. Unlike duration, a chapter may start at zero (`0` or `"00:00"`). Values are normalized to numeric seconds for chapter navigation and JSON Chapters output. Chapter timestamps must be within that recording. Each episode should have a unique number, a stable filename, and a recording URL that doesn’t change after publication.

See the [podcast RSS guide](rss.md) for artwork requirements and feed output.

## Add a journal post

Create `src/content/blog/your-post.mdx`:

```mdx
---
title: 'A thought after the recording'
description: 'The conversation continued after we put the microphones away.'
publishedAt: 2026-10-14
category: Field notes
authors:
  - alex-morgan
episode: your-episode
---

Write your post here.
```

`authors` is a required, non-empty array of host IDs from `src/data/hosts/`. Multiple authors are supported. Their names, roles, bios, avatars, and links come from the host collection; unknown author IDs fail the build. Article bylines, author profiles, metadata, and journal RSS creators use the associated authors.

`episode` is optional and refers to an episode’s filename without the extension. The related listening link only appears for a published episode.

Listeners can play episodes directly on the site or subscribe through the podcast RSS feed at `/podcast.xml`.
