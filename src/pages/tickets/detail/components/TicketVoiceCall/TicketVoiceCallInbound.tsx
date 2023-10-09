import React from 'react'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import {VoiceCall} from 'models/voiceCall/types'

import TicketVoiceCallContainer from './TicketVoiceCallContainer'
import {useCustomerDetails} from './hooks'

type Props = {
    voiceCall: VoiceCall
}

export default function TicketVoiceCallInbound({voiceCall}: Props) {
    const {customer} = useCustomerDetails(voiceCall.customer_id)

    return (
        <TicketVoiceCallContainer
            user={customer}
            initiatorLabel={
                <VoiceCallCustomerLabel
                    customerId={voiceCall.customer_id}
                    phoneNumber={voiceCall.phone_number_source}
                />
            }
        />
    )
}
