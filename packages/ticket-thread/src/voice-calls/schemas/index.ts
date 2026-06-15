import { z } from 'zod'

export const voiceCallSchema = z.object({
    id: z.number(),
    provider: z.string(),
    status: z.string(),
    direction: z.string(),
    phone_number_source: z.string(),
    phone_number_destination: z.string(),
})
export type VoiceCallSchema = z.infer<typeof voiceCallSchema>

export const outboundVoiceCallSchema = voiceCallSchema.extend({
    initiated_by_agent_id: z.number(),
})
export type OutboundVoiceCallSchema = z.infer<typeof outboundVoiceCallSchema>
