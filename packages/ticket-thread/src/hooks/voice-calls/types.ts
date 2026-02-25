import type { Prettify } from '@repo/types'

import type { VoiceCall } from '@gorgias/helpdesk-queries'

import type { TicketThreadItemTag } from '../types'
import type { OutboundVoiceCallSchema } from './schemas'

export type TicketThreadVoiceCallItem = {
    _tag: typeof TicketThreadItemTag.VoiceCalls.VoiceCall
    data: VoiceCall
    datetime: string
}

export type TicketThreadOutboundVoiceCallItem = {
    _tag: typeof TicketThreadItemTag.VoiceCalls.OutboundVoiceCall
    data: Prettify<VoiceCall & OutboundVoiceCallSchema>
    datetime: string
}
