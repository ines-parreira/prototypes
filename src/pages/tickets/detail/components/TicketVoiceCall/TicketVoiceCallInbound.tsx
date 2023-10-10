import React from 'react'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import {VoiceCall} from 'models/voiceCall/types'

import TicketVoiceCallContainer from './TicketVoiceCallContainer'
import {useCustomerDetails} from './hooks'
import {TicketVoiceCallInboundStatus} from './TicketVoiceCallInboundStatus'

type Props = {
    voiceCall: VoiceCall
}

export default function TicketVoiceCallInbound({voiceCall}: Props) {
    const {customer} = useCustomerDetails(voiceCall.customer_id)

    return (
        <TicketVoiceCallContainer
            user={customer}
            dateTime={voiceCall.started_datetime}
            initiatorLabel={
                <VoiceCallCustomerLabel
                    customerId={voiceCall.customer_id}
                    phoneNumber={voiceCall.phone_number_source}
                />
            }
            callStatus={<TicketVoiceCallInboundStatus voiceCall={voiceCall} />}
        />
    )
}
