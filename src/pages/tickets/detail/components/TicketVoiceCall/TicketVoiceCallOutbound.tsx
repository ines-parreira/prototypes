import React from 'react'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import {OutboundVoiceCall} from 'models/voiceCall/types'
import {isFinalVoiceCallStatus} from 'models/voiceCall/utils'

import TicketVoiceCallContainer from './TicketVoiceCallContainer'
import {useAgentDetails} from './hooks'
import TicketVoiceCallOutboundStatus from './TicketVoiceCallOutboundStatus'

type Props = {
    voiceCall: OutboundVoiceCall
}

export default function TicketVoiceCallOutbound({voiceCall}: Props) {
    const {data: agent} = useAgentDetails(voiceCall.initiated_by_agent_id)

    return (
        <TicketVoiceCallContainer
            user={agent}
            dateTime={voiceCall.created_datetime}
            header={
                <>
                    <VoiceCallAgentLabel
                        agentId={voiceCall.initiated_by_agent_id}
                        phoneNumber={voiceCall.phone_number_source}
                    />
                    {isFinalVoiceCallStatus(voiceCall.status)
                        ? 'made a call'
                        : 'is making a call'}
                </>
            }
            callStatus={<TicketVoiceCallOutboundStatus voiceCall={voiceCall} />}
        />
    )
}
