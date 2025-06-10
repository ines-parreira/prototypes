import classNames from 'classnames'

import {
    PhoneRingingBehaviour,
    useGetVoiceQueue,
} from '@gorgias/helpdesk-queries'
import { Skeleton } from '@gorgias/merchant-ui-kit'

import {
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
    const displayStatus = getInboundDisplayStatus(
        voiceCall.status,
        voiceCall.termination_status,
        voiceCall.last_answered_by_agent_id,
        voiceCall.status_in_queue,
    )

    switch (displayStatus) {
        case VoiceCallDisplayStatus.Routing:
            return (
                <>
                    {getPrettyVoiceCallDisplayStatusName(
                        VoiceCallDisplayStatus.Routing,
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
                            <div>Answered by </div>
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
                    <TicketVoiceCallEvents
                        callId={voiceCall.id}
                        terminationStatus={voiceCall.termination_status}
                    />
                </CollapsibleDetails>
            )
        case VoiceCallDisplayStatus.Missed:
        case VoiceCallDisplayStatus.Abandoned:
        case VoiceCallDisplayStatus.Cancelled:
        case VoiceCallDisplayStatus.CallbackRequested:
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
                            {displayStatus ===
                            VoiceCallDisplayStatus.CallbackRequested ? (
                                <>
                                    <i
                                        className={classNames(
                                            'material-icons',
                                            css.missedCallIcon,
                                        )}
                                    >
                                        phone_callback
                                    </i>
                                    <div>Callback requested</div>
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    }
                >
                    <TicketVoiceCallEvents
                        callId={voiceCall.id}
                        terminationStatus={voiceCall.termination_status}
                    />
                </CollapsibleDetails>
            )
        case VoiceCallDisplayStatus.Queued:
            return (
                <>
                    {getPrettyVoiceCallDisplayStatusName(
                        VoiceCallDisplayStatus.Queued,
                    )}
                </>
            )
        case VoiceCallDisplayStatus.Calling:
            return <CallingStatus voiceCall={voiceCall} />
        default:
            return null
    }
}

const CallingStatus = ({ voiceCall }: { voiceCall: VoiceCall }) => {
    const {
        data: queueData,
        isLoading: isQueueLoading,
        isError: isQueueError,
    } = useGetVoiceQueue(voiceCall.queue_id ?? 0, undefined, {
        query: {
            refetchOnWindowFocus: false,
        },
    })

    if (isQueueLoading || isQueueError) {
        return (
            <div className={classNames(css.statusWrapper, css.inbound)}>
                Calling <Skeleton width={70} />
            </div>
        )
    }

    if (
        queueData?.data?.distribution_mode === PhoneRingingBehaviour.Broadcast
    ) {
        return <div>Calling agents</div>
    }

    return (
        <div className={classNames(css.statusWrapper, css.inbound)}>
            <div>Calling </div>
            {voiceCall.last_rang_agent_id && (
                <VoiceCallAgentLabel
                    agentId={voiceCall.last_rang_agent_id}
                    phoneNumber={voiceCall.phone_number_destination}
                />
            )}
        </div>
    )
}
