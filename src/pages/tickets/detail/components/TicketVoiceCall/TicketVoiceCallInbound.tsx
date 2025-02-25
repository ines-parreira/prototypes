import React from 'react'

import { VoiceCall } from 'models/voiceCall/types'
import { isFinalVoiceCallStatus } from 'models/voiceCall/utils'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import { formatPhoneNumberInternational } from 'pages/phoneNumbers/utils'

import { useCustomerDetails } from './hooks'
import TicketVoiceCallContainer from './TicketVoiceCallContainer'
import { TicketVoiceCallInboundStatus } from './TicketVoiceCallInboundStatus'

type Props = {
    voiceCall: VoiceCall
}

export default function TicketVoiceCallInbound({ voiceCall }: Props) {
    const { customer } = useCustomerDetails({
        customerId: voiceCall.customer_id,
    })

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
            icon={'call_received'}
            callStatus={<TicketVoiceCallInboundStatus voiceCall={voiceCall} />}
            voiceCall={voiceCall}
            source={{
                from: `${customer?.firstname ?? ''} ${
                    customer?.lastname ?? ''
                } (${formatPhoneNumberInternational(
                    voiceCall.phone_number_source,
                )})`,
                to: formatPhoneNumberInternational(
                    voiceCall.phone_number_destination,
                ),
            }}
        />
    )
}
