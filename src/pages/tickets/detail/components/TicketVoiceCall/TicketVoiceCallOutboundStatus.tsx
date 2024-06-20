import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    getDisplayOutboundVoiceCallStatus,
    VoiceCall,
    VoiceCallDisplayStatus,
} from 'models/voiceCall/types'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import TicketVoiceCallEvents from './TicketVoiceCallEvents'
import CollapsibleDetails from './CollapsibleDetails'

import css from './TicketVoiceCallContainer.less'

type Props = {
    voiceCall: VoiceCall
}

export default function TicketVoiceCallOutboundStatus({voiceCall}: Props) {
    const isCallTransferEnabled = useFlags()[FeatureFlagKey.CallTransfer]
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
                    that is no longer in service, inputting a number incorrectly
                    or dialing a number with poor reputation.
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
            return isCallTransferEnabled ? (
                <CollapsibleDetails title={answeredStatus}>
                    <TicketVoiceCallEvents callId={voiceCall.id} />
                </CollapsibleDetails>
            ) : (
                answeredStatus
            )
        default:
            return null
    }
}
