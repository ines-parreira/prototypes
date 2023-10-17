import React from 'react'
import {VoiceCall, VoiceCallStatus} from 'models/voiceCall/types'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'

import css from './TicketVoiceCallContainer.less'

type Props = {
    voiceCall: VoiceCall
}

export default function TicketVoiceCallOutboundStatus({voiceCall}: Props) {
    switch (voiceCall.status) {
        case VoiceCallStatus.Ringing:
        case VoiceCallStatus.InProgress:
            return (
                <div className={css.statusWrapper}>
                    <div>Waiting for</div>
                    <VoiceCallCustomerLabel
                        customerId={voiceCall.customer_id}
                        phoneNumber={voiceCall.phone_number_source}
                    />
                </div>
            )
        case VoiceCallStatus.Failed:
            return (
                <div className={css.errorStatus}>
                    <strong>Failed: </strong>Our provider's carriers could not
                    connect the call. Possible causes include dialing a number
                    is no longer in service or inputting a number incorrectly.
                </div>
            )
        case VoiceCallStatus.Canceled:
        case VoiceCallStatus.NoAnswer:
            return (
                <div className={css.statusWrapper}>
                    <div>Call missed by</div>
                    <VoiceCallCustomerLabel
                        customerId={voiceCall.customer_id}
                        phoneNumber={voiceCall.phone_number_source}
                    />
                </div>
            )
        case VoiceCallStatus.Answered:
        case VoiceCallStatus.Connected:
        case VoiceCallStatus.Completed:
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
