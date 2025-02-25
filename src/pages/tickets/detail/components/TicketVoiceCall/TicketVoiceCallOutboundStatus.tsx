import React from 'react'

import {
    getDisplayOutboundVoiceCallStatus,
    VoiceCall,
    DEPRECATED_VoiceCallDisplayStatus,
} from 'models/voiceCall/types'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'

import CollapsibleDetails from './CollapsibleDetails'

import css from './TicketVoiceCallContainer.less'
import TicketVoiceCallEvents from './TicketVoiceCallEvents'

type Props = {
    voiceCall: VoiceCall
}

export default function TicketVoiceCallOutboundStatus({voiceCall}: Props) {
    const answeredStatus = (
        <div className={css.statusWrapper}>
            <div>Answered by</div>
            <VoiceCallCustomerLabel
                customerId={voiceCall.customer_id}
                phoneNumber={voiceCall.phone_number_source}
            />
        </div>
    )
    switch (getDisplayOutboundVoiceCallStatus(voiceCall.status)) {
        case DEPRECATED_VoiceCallDisplayStatus.Ringing:
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
        case DEPRECATED_VoiceCallDisplayStatus.Failed:
            return (
                <div className={css.errorStatus}>
                    <strong>Failed: </strong>
                    {`Our provider's carriers could not
                    connect the call. Possible causes include dialing a number
                    that is no longer in service, inputting a number incorrectly
                    or dialing a number with poor reputation.`}
                </div>
            )
        case DEPRECATED_VoiceCallDisplayStatus.Missed:
            return (
                <div className={css.statusWrapper}>
                    <div className={css.errorStatus}>Call missed by</div>
                    <VoiceCallCustomerLabel
                        customerId={voiceCall.customer_id}
                        phoneNumber={voiceCall.phone_number_source}
                    />
                </div>
            )
        case DEPRECATED_VoiceCallDisplayStatus.InProgress:
        case DEPRECATED_VoiceCallDisplayStatus.Answered:
            return (
                <CollapsibleDetails title={answeredStatus}>
                    <TicketVoiceCallEvents callId={voiceCall.id} />
                </CollapsibleDetails>
            )

        default:
            return null
    }
}
