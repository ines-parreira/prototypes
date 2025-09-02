import {
    getOutboundDisplayStatus,
    VoiceCall,
    VoiceCallDisplayStatus,
} from 'models/voiceCall/types'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import TicketVoiceCallEvents from 'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCallEvents'

import CollapsibleDetails from './CollapsibleDetails'

import css from './TicketVoiceCallContainer.less'

type Props = {
    voiceCall: VoiceCall
}

export default function TicketVoiceCallOutboundStatus({ voiceCall }: Props) {
    const displayStatus = getOutboundDisplayStatus(voiceCall.status)
    switch (displayStatus) {
        case VoiceCallDisplayStatus.Ringing:
            return (
                <div className={css.statusWrapper}>
                    <div>Waiting for </div>
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
                    <strong>Failed: </strong>
                    {`Our provider's carriers could not
                connect the call. Possible causes include dialing a number
                that is no longer in service, inputting a number incorrectly
                or dialing a number with poor reputation.`}
                </div>
            )
        case VoiceCallDisplayStatus.InProgress:
        case VoiceCallDisplayStatus.Answered:
            return (
                <CollapsibleDetails
                    title={
                        <div className={css.statusWrapper}>
                            <div>Answered by </div>
                            <VoiceCallCustomerLabel
                                customerId={voiceCall.customer_id}
                                phoneNumber={voiceCall.phone_number_source}
                                interactable
                            />
                        </div>
                    }
                >
                    <TicketVoiceCallEvents callId={voiceCall.id} />
                </CollapsibleDetails>
            )
        case VoiceCallDisplayStatus.Unanswered:
            return (
                <div className={css.statusWrapper}>
                    <div className={css.errorStatus}>Unanswered by </div>
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
