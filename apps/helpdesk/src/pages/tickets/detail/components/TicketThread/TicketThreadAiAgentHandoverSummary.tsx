import { useEffect, useMemo, useState } from 'react'

import {
    MessageBubble,
    MessageHeaderContainer,
    MessageTimestamp,
    useTicketSummary,
} from '@repo/ticket-thread'
import type { TicketThreadAiAgentHandoverSummaryParams } from '@repo/ticket-thread/legacy-bridge'

import { AIThinking, Box, Button, Icon, Text } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import {
    ReasoningResponseType,
    useGetFeedback,
    useGetMessageAiReasoning,
} from 'models/knowledgeService/queries'
import { AiAgentFeedbackTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import type { FeedbackRating } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { AiAgentHandoverOutcome } from 'pages/tickets/detail/components/TicketMessages/AiAgentHandoverOutcome'
import { getTicketState } from 'state/ticket/selectors'

import { AiAgentRatingTag } from './AiAgentRatingTag'
import { SummaryContent } from './SummaryContent'

type Props = {
    message: Pick<
        TicketThreadAiAgentHandoverSummaryParams['message'],
        'id' | 'created_datetime'
    >
}

export function TicketThreadAiAgentHandoverSummary({ message }: Props) {
    const ticket = useAppSelector(getTicketState)
    const ticketId: number = ticket.get('id')
    const initialSummary = ticket.get('summary')?.toJS()

    const { summary, isLoading, errorMessage, isRetriable, requestSummary } =
        useTicketSummary({
            ticketId,
            initialSummary,
        })

    const lastMessageDatetime = ticket.get('last_message_datetime')
    const isSummaryStale = Boolean(
        lastMessageDatetime && lastMessageDatetime > message.created_datetime,
    )

    const messageId = String(message.id ?? '')
    const { data: reasoningData, isLoading: isOutcomeLoading } =
        useGetMessageAiReasoning(
            { objectId: ticketId.toString(), objectType: 'TICKET', messageId },
            { enabled: !!messageId },
        )

    const outcome = useMemo(
        () =>
            reasoningData?.reasoning?.find(
                (r) => r.responseType === ReasoningResponseType.OUTCOME,
            )?.value ?? null,
        [reasoningData?.reasoning],
    )

    const { data: feedback, isLoading: isFeedbackLoading } = useGetFeedback(
        { objectId: ticketId.toString(), objectType: 'TICKET' },
        { enabled: !!ticketId },
    )

    const ticketRating = feedback?.executions
        ?.flatMap((execution) => execution.feedback)
        .find(
            (item) =>
                item.feedbackType === AiAgentFeedbackTypeEnum.TICKET_RATING,
        )

    const ratingValue = ticketRating?.feedbackValue as
        | FeedbackRating
        | undefined

    const [isExpanded, setIsExpanded] = useState(true)

    useEffect(() => {
        if (!initialSummary && !isSummaryStale) {
            requestSummary()
        }
    }, [initialSummary, isSummaryStale, requestSummary])

    const hasSummaryContentIgnoringStale = Boolean(
        summary?.content || isLoading || errorMessage,
    )
    const hasSummaryContent = hasSummaryContentIgnoringStale && !isSummaryStale

    if (
        !hasSummaryContent &&
        !isSummaryStale &&
        !isOutcomeLoading &&
        !outcome &&
        !isFeedbackLoading &&
        !ratingValue
    ) {
        return null
    }

    return (
        <MessageBubble variant="ai-agent-handover" isGroupedMessage={true}>
            <MessageHeaderContainer>
                <Box alignItems="center" gap="xs">
                    <AIThinking variant="static" />
                    <Text
                        size="md"
                        color="content-neutral-default"
                        variant="bold"
                    >
                        Handover Summary
                    </Text>
                    {ratingValue && <AiAgentRatingTag rating={ratingValue} />}
                </Box>
                <Box alignItems="center" gap="xxs">
                    <MessageTimestamp
                        createdDatetime={message.created_datetime}
                    />
                    <Button
                        icon={
                            <Icon
                                name={
                                    isExpanded
                                        ? 'arrow-chevron-up'
                                        : 'arrow-chevron-down'
                                }
                                size="sm"
                            />
                        }
                        variant="tertiary"
                        size="sm"
                        intent="regular"
                        onClick={() => setIsExpanded((prev) => !prev)}
                    />
                </Box>
            </MessageHeaderContainer>
            {isExpanded && (
                <Box flexDirection="column" gap="sm">
                    {(hasSummaryContent || isSummaryStale) && (
                        <Box flexDirection="column" gap="xxs">
                            {hasSummaryContent ? (
                                <SummaryContent
                                    isLoading={isLoading}
                                    errorMessage={errorMessage}
                                    isRetriable={isRetriable}
                                    summary={summary}
                                    requestSummary={requestSummary}
                                />
                            ) : (
                                <Text
                                    size="sm"
                                    color="content-neutral-secondary"
                                >
                                    New messages have been added since this
                                    summary was generated. You can refresh it
                                    below.
                                </Text>
                            )}
                        </Box>
                    )}
                    <AiAgentHandoverOutcome
                        outcome={outcome}
                        isLoading={isOutcomeLoading}
                    />
                </Box>
            )}
        </MessageBubble>
    )
}
