import { z } from 'astro/zod'

export const timestampSchema = z
  .union([z.number(), z.string()])
  .transform((value, context) => {
    let seconds: number | undefined
    if (typeof value === 'number') {
      seconds = value
    } else {
      const parts = value.trim().match(/^(?:(\d+):)?(\d+):([0-5]\d(?:\.\d+)?)$/)
      if (parts) {
        const hours = Number(parts[1] ?? 0)
        const minutes = Number(parts[2])
        // With an hour field, minutes must be in the range 00–59.
        if (parts[1] === undefined || (parts[2].length === 2 && minutes < 60)) {
          seconds = hours * 3600 + minutes * 60 + Number(parts[3])
        }
      }
    }
    if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
      context.addIssue({
        code: 'custom',
        message:
          'Use nonnegative seconds or "MM:SS" / "HH:MM:SS". Seconds, and minutes after hours, must be below 60.',
      })
      return z.NEVER
    }
    return seconds
  })

export const durationSchema = timestampSchema.pipe(
  z.number().positive({ message: 'Audio duration must be greater than zero.' }),
)
