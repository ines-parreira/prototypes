import { formatDatetime } from '@repo/utils'

import { Avatar, Box, Color, Icon, Text } from '@gorgias/axiom'

import type { TicketThreadSatisfactionSurveyItemByStatus } from '../../hooks/satisfaction-survey/types'
import { useTicketThreadDateTimeFormat } from '../../hooks/shared/useTicketThreadDateTimeFormat'
import { MessageBubble } from '../MessageBubble/MessageBubble'

type TicketThreadRespondedSatisfactionSurveyProps = {
    item: TicketThreadSatisfactionSurveyItemByStatus<'responded'>
}

export function TicketThreadRespondedSatisfactionSurvey({
    item,
}: TicketThreadRespondedSatisfactionSurveyProps) {
    const { format, timezone } = useTicketThreadDateTimeFormat()

    const { data } = item
    const score = data.score

    return (
        <MessageBubble>
            <Box justifyContent="space-between" alignItems="center">
                <Box alignItems="center" gap="xs">
                    <Avatar name={data.authorLabel} size="md" />
                    <Text size="md" variant="bold">
                        {data.authorLabel}
                    </Text>
                </Box>
                <Box alignItems="center" gap="xs">
                    <Icon
                        name="star"
                        size="sm"
                        color="content-neutral-secondary"
                    />
                    {item.datetime && (
                        <Text size="sm">
                            {formatDatetime(
                                item.datetime,
                                format.relative,
                                timezone,
                            )}
                        </Text>
                    )}
                </Box>
            </Box>
            <Box gap="xxxxs" alignItems="center">
                <Box>
                    {Array.from({ length: 5 }, (_, index) => (
                        <Icon
                            key={`star-${item.datetime}-${index}`}
                            name={index < score ? 'star-full' : 'star'}
                            size="sm"
                            color={
                                index < score
                                    ? Color.Yellow
                                    : 'content-neutral-secondary'
                            }
                        />
                    ))}
                </Box>
                <Text size="sm" color="content-neutral-default">
                    {`${score} ${score === 1 ? 'star' : 'stars'} CSAT review`}
                </Text>
            </Box>
            {data.body_text && <Text size="sm">{data.body_text}</Text>}
        </MessageBubble>
    )
}
