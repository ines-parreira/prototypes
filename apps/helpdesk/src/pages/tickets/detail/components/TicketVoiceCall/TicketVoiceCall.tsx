import type { VoiceCall } from 'models/voiceCall/types'
import { isOutboundVoiceCall } from 'models/voiceCall/types'

import { TicketVoiceCallInbound } from './TicketVoiceCallInbound'
import { TicketVoiceCallOutbound } from './TicketVoiceCallOutbound'

type VoiceCallProps = {
    voiceCall: VoiceCall
}

export function TicketVoiceCall({ voiceCall }: VoiceCallProps) {
    return (
        <div>
            {isOutboundVoiceCall(voiceCall) ? (
                <TicketVoiceCallOutbound voiceCall={voiceCall} />
            ) : (
                <TicketVoiceCallInbound voiceCall={voiceCall} />
            )}
        </div>
    )
}
