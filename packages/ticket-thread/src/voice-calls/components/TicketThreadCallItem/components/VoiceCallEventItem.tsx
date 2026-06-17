import { Box, Text } from '@gorgias/axiom'

import { MessageTimestamp } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp'
import type { ProcessedEvent } from '#voice-calls/models/processEvents'
import { VoiceCallSubjectLabel } from './VoiceCallSubjectLabel'
import { VoiceCallTimelineItem } from './VoiceCallTimeline'

import css from './VoiceCallEventItem.less'

const TEXT_SIZE = 'sm'

type VoiceCallEventItemProps = {
    event: ProcessedEvent
}

function getActionPrettyName(event: ProcessedEvent) {
    if (event.showTransferPrefix) {
        return `Transfer ${event.action}`
    }
    return event.action.charAt(0).toUpperCase() + event.action.slice(1)
}

export function VoiceCallEventItem({ event }: VoiceCallEventItemProps) {
    return (
        <VoiceCallTimelineItem>
            <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap="xs"
                className={css.flex1}
            >
                <Box
                    flexDirection="row"
                    alignItems="center"
                    className={css.flexWrapPreWrap}
                >
                    <Text
                        as="span"
                        color="content-neutral-secondary"
                        size={TEXT_SIZE}
                    >
                        {getActionPrettyName(event)}
                    </Text>
                    {event.actor && (
                        <>
                            <Text
                                as="span"
                                color="content-neutral-secondary"
                                size={TEXT_SIZE}
                            >
                                {' '}
                                by{' '}
                            </Text>
                            <VoiceCallSubjectLabel
                                subject={event.actor}
                                size={TEXT_SIZE}
                            />
                        </>
                    )}
                    {event.target && (
                        <>
                            <Text
                                as="span"
                                color="content-neutral-secondary"
                                size={TEXT_SIZE}
                            >
                                {event.connector || ' to '}
                            </Text>
                            <VoiceCallSubjectLabel
                                subject={event.target}
                                size={TEXT_SIZE}
                            />
                        </>
                    )}
                    {event.extra && (
                        <Text
                            as="span"
                            color="content-neutral-secondary"
                            size={TEXT_SIZE}
                        >
                            {' '}
                            ({event.extra})
                        </Text>
                    )}
                </Box>
                <MessageTimestamp createdDatetime={event.datetime} />
            </Box>
        </VoiceCallTimelineItem>
    )
}
