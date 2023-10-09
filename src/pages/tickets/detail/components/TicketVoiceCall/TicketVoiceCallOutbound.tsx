import React from 'react'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import {OutboundVoiceCall} from 'models/voiceCall/types'

import TicketVoiceCallContainer from './TicketVoiceCallContainer'
import {useAgentDetails} from './hooks'

type Props = {
    voiceCall: OutboundVoiceCall
}

export default function TicketVoiceCallOutbound({voiceCall}: Props) {
    const {data: agent} = useAgentDetails(voiceCall.initiated_by_agent_id)

    return (
        <TicketVoiceCallContainer
            user={agent}
            initiatorLabel={
                <VoiceCallAgentLabel
                    agentId={voiceCall.initiated_by_agent_id}
                    phoneNumber={voiceCall.phone_number_source}
                />
            }
        />
    )
}
