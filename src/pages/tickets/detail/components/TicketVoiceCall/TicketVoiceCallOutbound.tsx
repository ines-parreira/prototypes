import React from 'react'

import {OutboundVoiceCall} from 'models/voiceCall/types'
import {isFinalVoiceCallStatus} from 'models/voiceCall/utils'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'

import {formatPhoneNumberInternational} from 'pages/phoneNumbers/utils'

import {useAgentDetails, useCustomerDetails} from './hooks'
import TicketVoiceCallContainer from './TicketVoiceCallContainer'
import TicketVoiceCallOutboundStatus from './TicketVoiceCallOutboundStatus'

type Props = {
    voiceCall: OutboundVoiceCall
}

export default function TicketVoiceCallOutbound({voiceCall}: Props) {
    const {data: agent} = useAgentDetails(voiceCall.initiated_by_agent_id)
    const {customer} = useCustomerDetails({customerId: voiceCall.customer_id})

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
            icon={'call_made'}
            callStatus={<TicketVoiceCallOutboundStatus voiceCall={voiceCall} />}
            voiceCall={voiceCall}
            source={{
                from: formatPhoneNumberInternational(
                    voiceCall.phone_number_source
                ),
                to: `${customer?.firstname ?? ''} ${
                    customer?.lastname ?? ''
                } (${formatPhoneNumberInternational(
                    voiceCall.phone_number_destination
                )})`,
            }}
        />
    )
}
