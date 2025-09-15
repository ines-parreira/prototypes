import classNames from 'classnames'

import { Skeleton } from '@gorgias/axiom'
import {
    PhoneRingingBehaviour,
    useGetVoiceQueue,
} from '@gorgias/helpdesk-queries'

import {
    getInboundDisplayStatus,
    getPrettyVoiceCallDisplayStatusName,
    VoiceCall,
    VoiceCallDisplayStatus,
} from 'models/voiceCall/types'
import {
    getAnsweringVoiceSubject,
    isCallTransfer,
} from 'models/voiceCall/utils'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import VoiceCallSubjectLabel from 'pages/common/components/VoiceCallSubjectLabel/VoiceCallSubjectLabel'
import TicketVoiceCallEvents from 'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCallEvents'

import CollapsibleDetails from './CollapsibleDetails'

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
    const isTransfer = isCallTransfer(voiceCall)

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
            const answeredBySubject = getAnsweringVoiceSubject(voiceCall)

            return (
                <WithCallEvents
                    voiceCall={voiceCall}
                    statusElement={
                        <div
                            className={classNames(
                                css.statusWrapper,
                                css.inbound,
                            )}
                        >
                            <div>Answered by </div>
                            {answeredBySubject && (
                                <VoiceCallSubjectLabel
                                    subject={answeredBySubject}
                                />
                            )}
                        </div>
                    }
                />
            )
        case VoiceCallDisplayStatus.Missed:
        case VoiceCallDisplayStatus.Abandoned:
        case VoiceCallDisplayStatus.Cancelled:
        case VoiceCallDisplayStatus.CallbackRequested:
            return (
                <WithCallEvents
                    voiceCall={voiceCall}
                    statusElement={
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
                />
            )
        case VoiceCallDisplayStatus.Queued:
            if (isTransfer) {
                return (
                    <WithCallEvents
                        voiceCall={voiceCall}
                        statusElement={<span>Transferring to queue...</span>}
                    />
                )
            }

            return (
                <>
                    {getPrettyVoiceCallDisplayStatusName(
                        VoiceCallDisplayStatus.Queued,
                    )}
                </>
            )
        case VoiceCallDisplayStatus.Calling:
            if (isTransfer) {
                return (
                    <WithCallEvents
                        voiceCall={voiceCall}
                        statusElement={
                            <CallingStatus voiceCall={voiceCall} isTransfer />
                        }
                    />
                )
            }

            return <CallingStatus voiceCall={voiceCall} />
        default:
            return null
    }
}

type CallingStatusProps = {
    voiceCall: VoiceCall
    isTransfer?: boolean
}

const CallingStatus = ({
    voiceCall,
    isTransfer = false,
}: CallingStatusProps) => {
    const {
        data: queueData,
        isLoading: isQueueLoading,
        isError: isQueueError,
    } = useGetVoiceQueue(voiceCall.queue_id ?? 0, undefined, {
        query: {
            refetchOnWindowFocus: false,
        },
    })

    const verb = isTransfer ? 'Transferring to' : 'Calling'

    if (isQueueLoading || isQueueError) {
        return (
            <div className={classNames(css.statusWrapper, css.inbound)}>
                {verb} <Skeleton width={70} />
            </div>
        )
    }

    if (
        queueData?.data?.distribution_mode === PhoneRingingBehaviour.Broadcast
    ) {
        return <div>{verb} agents</div>
    }

    return (
        <div className={classNames(css.statusWrapper, css.inbound)}>
            <div>{verb} </div>
            {voiceCall.last_rang_agent_id && (
                <VoiceCallAgentLabel
                    agentId={voiceCall.last_rang_agent_id}
                    phoneNumber={voiceCall.phone_number_destination}
                />
            )}
        </div>
    )
}

type WithCallEventsProps = {
    voiceCall: VoiceCall
    statusElement: JSX.Element
}

const WithCallEvents = ({ voiceCall, statusElement }: WithCallEventsProps) => {
    return (
        <CollapsibleDetails title={statusElement}>
            <TicketVoiceCallEvents
                callId={voiceCall.id}
                terminationStatus={voiceCall.termination_status}
            />
        </CollapsibleDetails>
    )
}
