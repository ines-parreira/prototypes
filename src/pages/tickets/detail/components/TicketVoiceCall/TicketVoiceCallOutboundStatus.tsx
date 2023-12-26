import React from 'react'
import {
    getDisplayOutboundVoiceCallStatus,
    VoiceCall,
    VoiceCallDisplayStatus,
} from 'models/voiceCall/types'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'

import css from './TicketVoiceCallContainer.less'

type Props = {
    voiceCall: VoiceCall
}

export default function TicketVoiceCallOutboundStatus({voiceCall}: Props) {
    switch (getDisplayOutboundVoiceCallStatus(voiceCall.status)) {
        case VoiceCallDisplayStatus.Ringing:
            return (
                <div className={css.statusWrapper}>
                    <div>Waiting for</div>
                    <VoiceCallCustomerLabel
                        customerId={voiceCall.customer_id}
                        phoneNumber={voiceCall.phone_number_source}
                    />
                    ...
                </div>
            )
        case VoiceCallDisplayStatus.Failed:
            return (
                <div className={css.errorStatus}>
                    <strong>Failed: </strong>Our provider's carriers could not
                    connect the call. Possible causes include dialing a number
                    is no longer in service or inputting a number incorrectly.
                </div>
            )
        case VoiceCallDisplayStatus.Missed:
            return (
                <div className={css.statusWrapper}>
                    <div className={css.errorStatus}>Call missed by</div>
                    <VoiceCallCustomerLabel
                        customerId={voiceCall.customer_id}
                        phoneNumber={voiceCall.phone_number_source}
                    />
                </div>
            )
        case VoiceCallDisplayStatus.InProgress:
        case VoiceCallDisplayStatus.Answered:
            return (
                <div className={css.statusWrapper}>
                    <div>Answered by</div>
                    <VoiceCallCustomerLabel
                        customerId={voiceCall.customer_id}
                        phoneNumber={voiceCall.phone_number_source}
                    />
                </div>
            )
        default:
            return null
    }
}
