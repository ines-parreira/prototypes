import React from 'react'
import classNames from 'classnames'
import {VoiceCall, VoiceCallStatus} from 'models/voiceCall/types'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'

import css from './TicketVoiceCallContainer.less'

type Props = {
    voiceCall: VoiceCall
}

export const TicketVoiceCallInboundStatus = ({voiceCall}: Props) => {
    const answeredByAgentId = (
        <div className={css.statusWrapper}>
            <div>Answered by</div>
            {voiceCall.last_answered_by_agent_id && (
                <VoiceCallAgentLabel
                    agentId={voiceCall.last_answered_by_agent_id}
                    phoneNumber={voiceCall.phone_number_destination}
                />
            )}
        </div>
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
        case VoiceCallStatus.Canceled:
        case VoiceCallStatus.Completed:
            if (!voiceCall.last_answered_by_agent_id) {
                return (
                    <div
                        className={classNames(
                            css.errorStatus,
                            css.statusWrapper
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
