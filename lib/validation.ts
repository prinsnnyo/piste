import { z } from 'zod/v4'

export const messageInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message must be 500 characters or fewer'),
  lat: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
})

export type MessageInput = z.infer<typeof messageInputSchema>

export function parseMessageInput(body: unknown) {
  const result = messageInputSchema.safeParse(body)

  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message)
    return { success: false as const, errors }
  }

  return { success: true as const, data: result.data }
}
