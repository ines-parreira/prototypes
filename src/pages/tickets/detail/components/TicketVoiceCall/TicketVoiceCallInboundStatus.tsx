import React from 'react'

import classNames from 'classnames'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    DEPRECATED_getDisplayInboundVoiceCallStatus,
    DEPRECATED_VoiceCallDisplayStatus,
    getInboundDisplayStatus,
    getPrettyVoiceCallDisplayStatusName,
    VoiceCall,
    VoiceCallDisplayStatus,
} from 'models/voiceCall/types'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'

import CollapsibleDetails from './CollapsibleDetails'
import TicketVoiceCallEvents from './TicketVoiceCallEvents'

import css from './TicketVoiceCallContainer.less'

type Props = {
    voiceCall: VoiceCall
}

export const TicketVoiceCallInboundStatus = ({ voiceCall }: Props) => {
    const shouldShowNewUnansweredStatuses = useFlag(
        FeatureFlagKey.ShowNewUnansweredStatuses,
    )

    if (!shouldShowNewUnansweredStatuses) {
        switch (
            DEPRECATED_getDisplayInboundVoiceCallStatus(
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

    const displayStatus = getInboundDisplayStatus(
        voiceCall.status,
        voiceCall.termination_status,
        voiceCall.last_answered_by_agent_id,
    )
    switch (displayStatus) {
        case VoiceCallDisplayStatus.Ringing:
            return (
                <>
                    {getPrettyVoiceCallDisplayStatusName(
                        VoiceCallDisplayStatus.Ringing,
                    )}
                </>
            )
        case VoiceCallDisplayStatus.InProgress:
        case VoiceCallDisplayStatus.Answered:
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
        case VoiceCallDisplayStatus.Missed:
        case VoiceCallDisplayStatus.Abandoned:
        case VoiceCallDisplayStatus.Cancelled:
            return (
                <CollapsibleDetails
                    title={
                        <div
                            className={classNames(
                                displayStatus ===
                                    VoiceCallDisplayStatus.Cancelled
                                    ? css.greyStatus
                                    : css.errorStatus,
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
                            <div>
                                {getPrettyVoiceCallDisplayStatusName(
                                    displayStatus,
                                )}{' '}
                                call
                            </div>
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
