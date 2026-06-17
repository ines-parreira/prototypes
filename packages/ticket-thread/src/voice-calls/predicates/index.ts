import type { Prettify } from '@repo/types'

import type { VoiceCall } from '@gorgias/helpdesk-queries'

import type { OutboundVoiceCallSchema } from '#voice-calls/schemas'
import { outboundVoiceCallSchema, voiceCallSchema } from '#voice-calls/schemas'

export function isVoiceCall(input: unknown): input is VoiceCall {
    return voiceCallSchema.safeParse(input).success
}

export function isOutboundVoiceCall(
    input: unknown,
): input is Prettify<VoiceCall & OutboundVoiceCallSchema> {
    return outboundVoiceCallSchema.safeParse(input).success
}
