import React from 'react'

import {VoiceCall, isOutboundVoiceCall} from 'models/voiceCall/types'

import TicketVoiceCallInbound from './TicketVoiceCallInbound'
import TicketVoiceCallOutbound from './TicketVoiceCallOutbound'

type VoiceCallProps = {
    voiceCall: VoiceCall
}

export default function TicketVoiceCall({voiceCall}: VoiceCallProps) {
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
