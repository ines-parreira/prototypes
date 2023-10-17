import React from 'react'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import {VoiceCall} from 'models/voiceCall/types'

import {isFinalVoiceCallStatus} from 'models/voiceCall/utils'
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
            dateTime={voiceCall.created_datetime}
            header={
                <>
                    <VoiceCallCustomerLabel
                        customerId={voiceCall.customer_id}
                        phoneNumber={voiceCall.phone_number_source}
                    />
                    {isFinalVoiceCallStatus(voiceCall.status)
                        ? 'called'
                        : 'is calling'}
                </>
            }
            callStatus={<TicketVoiceCallInboundStatus voiceCall={voiceCall} />}
            voiceCall={voiceCall}
        />
    )
}
