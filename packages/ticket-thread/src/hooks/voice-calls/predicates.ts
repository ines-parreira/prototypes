import type { Prettify } from '@repo/types'

import type { VoiceCall } from '@gorgias/helpdesk-queries'

import type { OutboundVoiceCallSchema } from './schemas'
import { outboundVoiceCallSchema, voiceCallSchema } from './schemas'

export function isVoiceCall(input: unknown): input is VoiceCall {
    return voiceCallSchema.safeParse(input).success
}

export function isOutboundVoiceCall(
    input: unknown,
): input is Prettify<VoiceCall & OutboundVoiceCallSchema> {
    return outboundVoiceCallSchema.safeParse(input).success
}
