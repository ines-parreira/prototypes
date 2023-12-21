import React from 'react'
import classNames from 'classnames'

import {VoiceCall, VoiceCallStatus} from 'models/voiceCall/types'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'

import CollapsibleDetails from './CollapsibleDetails'
import TicketVoiceCallEvents from './TicketVoiceCallEvents'
import css from './TicketVoiceCallContainer.less'

type Props = {
    voiceCall: VoiceCall
}

export const TicketVoiceCallInboundStatus = ({voiceCall}: Props) => {
    const answeredByAgentId = (
        <CollapsibleDetails
            title={
                <div className={classNames(css.statusWrapper, css.inbound)}>
                    <div>Answered by</div>
                    {voiceCall.last_answered_by_agent_id && (
                        <VoiceCallAgentLabel
                            agentId={voiceCall.last_answered_by_agent_id}
                            phoneNumber={voiceCall.phone_number_destination}
                        />
                    )}
                </div>
            }
        >
            <TicketVoiceCallEvents callId={voiceCall.id} />
        </CollapsibleDetails>
    )

    switch (voiceCall.status) {
        case VoiceCallStatus.Ringing:
        case VoiceCallStatus.Initiated:
        case VoiceCallStatus.Queued:
        case VoiceCallStatus.InProgress:
            return <>Ringing</>
        case VoiceCallStatus.Failed:
        case VoiceCallStatus.NoAnswer:
            return <div className={css.errorStatus}>Failed</div>
        case VoiceCallStatus.Completed:
        case VoiceCallStatus.Ending:
            if (!voiceCall.last_answered_by_agent_id) {
                return (
                    <CollapsibleDetails
                        title={
                            <div
                                className={classNames(
                                    css.errorStatus,
                                    css.missedCallStatus
                                )}
                            >
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.missedCallIcon
                                    )}
                                >
                                    call_missed
                                </i>
                                <div>Missed call</div>
                            </div>
                        }
                    >
                        <TicketVoiceCallEvents callId={voiceCall.id} />
                    </CollapsibleDetails>
                )
            }
            return answeredByAgentId
        case VoiceCallStatus.Answered:
        case VoiceCallStatus.Connected:
            return answeredByAgentId
        default:
            return null
    }
}
