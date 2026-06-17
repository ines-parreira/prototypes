import { Box, Skeleton, Text } from '@gorgias/axiom'
import { VoiceCallTerminationStatus } from '@gorgias/helpdesk-types'

import { useVoiceCallEvents } from '#voice-calls/hooks/useVoiceCallEvents'
import {
    hasFlowEndEvent,
    processEvents,
} from '#voice-calls/models/processEvents'
import type { VoiceCallEvent } from '#voice-calls/models/types'
import { VoiceCallEventItem } from './VoiceCallEventItem'
import { VoiceCallTimeline } from './VoiceCallTimeline'

type VoiceCallEventsProps = {
    callId: number
    terminationStatus?: VoiceCallTerminationStatus
}

export function VoiceCallEvents({
    callId,
    terminationStatus,
}: VoiceCallEventsProps) {
    const { events, isLoading, isError } = useVoiceCallEvents(callId)

    if (isLoading) {
        return <Skeleton height={100} />
    }

    if (!events || isError) {
        return (
            <Text color="content-error-default">
                <Text as="span" variant="bold">
                    Failed:
                </Text>{' '}
                Call events are not available.
            </Text>
        )
    }

    const rawEvents = (events ?? []) as unknown as VoiceCallEvent[]
    const processedEvents = processEvents(rawEvents)

    if (!processedEvents.length) {
        if (
            terminationStatus === VoiceCallTerminationStatus.Abandoned ||
            terminationStatus === VoiceCallTerminationStatus.Cancelled
        ) {
            return (
                <VoiceCallTimeline>
                    <Box padding="xs">
                        <Text color="content-neutral-secondary">
                            No events. The caller ended the call while waiting,
                            before reaching an available agent.
                        </Text>
                    </Box>
                </VoiceCallTimeline>
            )
        }

        if (hasFlowEndEvent(rawEvents)) {
            return (
                <VoiceCallTimeline>
                    <Box padding="xs">
                        <Text color="content-neutral-secondary">
                            No events. This call was handled by a flow and no
                            agent interaction took place until reaching the end
                            of the flow.
                        </Text>
                    </Box>
                </VoiceCallTimeline>
            )
        }

        return (
            <VoiceCallTimeline>
                <Box padding="xs">
                    <Text color="content-neutral-secondary">
                        No events. This call was either made outside business
                        hours or ended due to no available agents.
                    </Text>
                </Box>
            </VoiceCallTimeline>
        )
    }

    return (
        <VoiceCallTimeline fullWidth>
            {processedEvents.map((event, index) => (
                <VoiceCallEventItem event={event} key={index} />
            ))}
        </VoiceCallTimeline>
    )
}
