import React from 'react'
import {VoiceCall} from 'models/voiceCall/types'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'

type VoiceCallProps = {
    voiceCall: VoiceCall
}

export default function TicketVoiceCall({voiceCall}: VoiceCallProps) {
    return (
        <div>
            <div>VoiceCall</div>
            Initiated by{' '}
            {voiceCall.initiated_by_agent_id ? (
                <VoiceCallAgentLabel
                    agentId={voiceCall.initiated_by_agent_id}
                    phoneNumber={voiceCall.phone_number_source}
                />
            ) : (
                <div>
                    Customer {voiceCall.customer_id}
                    {voiceCall.last_answered_by_agent_id && (
                        <>
                            - picked up by{' '}
                            <VoiceCallAgentLabel
                                agentId={voiceCall.last_answered_by_agent_id}
                                phoneNumber={voiceCall.phone_number_destination}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
