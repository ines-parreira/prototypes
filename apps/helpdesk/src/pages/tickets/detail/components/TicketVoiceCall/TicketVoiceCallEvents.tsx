import { FeatureFlagKey } from '@repo/feature-flags'

import { Skeleton } from '@gorgias/axiom'
import { VoiceCallTerminationStatus } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
import { hasFlowEndEvent, processEvents } from 'models/voiceCall/processEvents'
import { useListVoiceCallEvents } from 'models/voiceCall/queries'

import TicketVoiceCallEvent from './TicketVoiceCallEvent'
import Timeline from './Timeline'

import css from './TicketVoiceCallContainer.less'

type TicketVoiceCallEventsProps = {
    callId: number
    terminationStatus?: VoiceCallTerminationStatus
}

const TicketVoiceCallEvents = ({
    callId,
    terminationStatus,
}: TicketVoiceCallEventsProps) => {
    const isExtendedCallFlows = useFlag(FeatureFlagKey.ExtendedCallFlows)
    const { data, isLoading, error } = useListVoiceCallEvents({
        call_id: callId,
    })

    if (isLoading) {
        return <Skeleton height={100} />
    }

    if (!data || error) {
        return (
            <div className={css.errorStatus}>
                <strong>Failed:</strong> Call events are not available.
            </div>
        )
    }

    const processedEvents = processEvents(data.data.data)

    if (!processedEvents.length) {
        if (
            terminationStatus === VoiceCallTerminationStatus.Abandoned ||
            terminationStatus === VoiceCallTerminationStatus.Cancelled
        ) {
            return (
                <Timeline>
                    <div className={css.noEventsInfo}>
                        No events. The caller ended the call while waiting,
                        before reaching an available agent.
                    </div>
                </Timeline>
            )
        }

        if (isExtendedCallFlows && hasFlowEndEvent(data.data.data)) {
            return (
                <Timeline>
                    <div className={css.noEventsInfo}>
                        No events. This call was handled by a flow and no agent
                        interaction took place until reaching the end of the
                        flow.
                    </div>
                </Timeline>
            )
        }

        return (
            <Timeline>
                <div className={css.noEventsInfo}>
                    No events. This call was either made outside business hours
                    or ended due to no available agents.
                </div>
            </Timeline>
        )
    }

    return (
        <Timeline useFullWidth>
            {processedEvents.map((event, index) => (
                <TicketVoiceCallEvent
                    event={event}
                    key={`call-event-${index}`}
                />
            ))}
        </Timeline>
    )
}

export default TicketVoiceCallEvents
