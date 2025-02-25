import React from 'react'

import classNames from 'classnames'

import {
    DEPRECATED_VoiceCallDisplayStatus,
    getDisplayInboundVoiceCallStatus,
    VoiceCall,
} from 'models/voiceCall/types'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'

import CollapsibleDetails from './CollapsibleDetails'
import TicketVoiceCallEvents from './TicketVoiceCallEvents'

import css from './TicketVoiceCallContainer.less'

type Props = {
    voiceCall: VoiceCall
}

export const TicketVoiceCallInboundStatus = ({ voiceCall }: Props) => {
    switch (
        getDisplayInboundVoiceCallStatus(
            voiceCall.status,
            voiceCall.last_answered_by_agent_id,
        )
    ) {
        case DEPRECATED_VoiceCallDisplayStatus.Ringing:
            return <>Ringing</>
        case DEPRECATED_VoiceCallDisplayStatus.Failed:
            return <div className={css.errorStatus}>Failed</div>
        case DEPRECATED_VoiceCallDisplayStatus.Missed:
            return (
                <CollapsibleDetails
                    title={
                        <div
                            className={classNames(
                                css.errorStatus,
                                css.missedCallStatus,
                            )}
                        >
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.missedCallIcon,
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
        case DEPRECATED_VoiceCallDisplayStatus.InProgress:
        case DEPRECATED_VoiceCallDisplayStatus.Answered:
            return (
                <CollapsibleDetails
                    title={
                        <div
                            className={classNames(
                                css.statusWrapper,
                                css.inbound,
                            )}
                        >
                            <div>Answered by</div>
                            {voiceCall.last_answered_by_agent_id && (
                                <VoiceCallAgentLabel
                                    agentId={
                                        voiceCall.last_answered_by_agent_id
                                    }
                                    phoneNumber={
                                        voiceCall.phone_number_destination
                                    }
                                />
                            )}
                        </div>
                    }
                >
                    <TicketVoiceCallEvents callId={voiceCall.id} />
                </CollapsibleDetails>
            )
        default:
            return null
    }
}
