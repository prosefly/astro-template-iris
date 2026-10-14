import { defineCollection, reference } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { durationSchema, timestampSchema } from './lib/time'
import { transcriptSchema } from './lib/transcript'

const shared = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  category: z.string(),
  draft: z.boolean().default(false),
})

const person = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  avatar: z.string().optional(),
  links: z
    .array(z.object({ label: z.string().min(1), url: z.url() }))
    .default([]),
})

const hosts = defineCollection({
  loader: glob({ base: './src/data/hosts', pattern: '**/*.yaml' }),
  schema: person,
})

const guests = defineCollection({
  loader: glob({ base: './src/data/guests', pattern: '**/*.yaml' }),
  schema: person,
})

const episodes = defineCollection({
  loader: glob({ base: './src/content/episodes', pattern: '**/*.{md,mdx}' }),
  schema: shared.extend({
    number: z.number().int().positive(),
    season: z.number().int().positive().default(1),
    hosts: z.array(reference('hosts')).min(1),
    guests: z.array(reference('guests')).default([]),
    artwork: z.string(),
    audio: z.object({
      src: z.string(),
      type: z.string().default('audio/mp4'),
      size: z.number().int().positive(), // Bytes.
      duration: durationSchema, // Normalized to seconds for players and feeds.
    }),
    transcript: transcriptSchema.optional(),
    chapters: z
      .array(z.object({ title: z.string(), start: timestampSchema }))
      .default([]),
  }),
})

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: shared.extend({
    authors: z.array(reference('hosts')).min(1),
    episode: reference('episodes').optional(),
  }),
})

export const collections = { hosts, guests, episodes, blog }
