import { useEffect, useMemo, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useCopyToClipboard } from '@repo/hooks'
import {
    BubbleActions,
    CopyButton,
    MessageBubble,
    MessageHeaderContainer,
    MessageTimestamp,
    useTicketSummary,
} from '@repo/ticket-thread'
import type { BubbleActionItem } from '@repo/ticket-thread'
import type { TicketThreadAiAgentHandoverSummaryParams } from '@repo/ticket-thread/legacy-bridge'

import { useParams } from 'react-router-dom'
import { AIThinking, Box, Button, Icon, Text } from '@gorgias/axiom'
import { useGetTicket } from '@gorgias/helpdesk-queries'
import {
    ReasoningResponseType,
    useGetFeedback,
    useGetMessageAiReasoning,
} from 'models/knowledgeService/queries'
import { AiAgentFeedbackTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import type { FeedbackRating } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { AiAgentHandoverOutcome } from 'pages/tickets/detail/components/TicketMessages/AiAgentHandoverOutcome'

import { AiAgentRatingTag } from './AiAgentRatingTag'
import { SummaryContent } from './SummaryContent'

type Props = {
    message: Pick<
        TicketThreadAiAgentHandoverSummaryParams['message'],
        'id' | 'created_datetime'
    >
}

export function TicketThreadAiAgentHandoverSummary({ message }: Props) {
    const { ticketId } = useParams<{ ticketId: string }>()
    const { data: ticket, isInitialLoading } = useGetTicket(
        Number(ticketId),
        undefined,
        {
            query: {
                select: (data) => data?.data,
                staleTime: Duration.minutes(5),
            },
        },
    )
    const initialSummary = ticket?.summary

    const { summary, isLoading, errorMessage, isRetriable, requestSummary } =
        useTicketSummary({
            ticketId: Number(ticketId),
            initialSummary,
        })

    const lastMessageDatetime = ticket?.last_message_datetime
    const isSummaryStale = Boolean(
        lastMessageDatetime && lastMessageDatetime > message.created_datetime,
    )

    const messageId = String(message.id ?? '')
    const { data: reasoningData, isLoading: isOutcomeLoading } =
        useGetMessageAiReasoning(
            { objectId: ticketId, objectType: 'TICKET', messageId },
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
        { objectId: ticketId, objectType: 'TICKET' },
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
        if (isInitialLoading) return
        if (!initialSummary && !isSummaryStale) {
            requestSummary()
        }
    }, [initialSummary, isSummaryStale, requestSummary, isInitialLoading])

    const hasSummaryContentIgnoringStale = Boolean(
        summary?.content || isLoading || errorMessage,
    )
    const hasSummaryContent = hasSummaryContentIgnoringStale && !isSummaryStale

    const [, copyToClipboard] = useCopyToClipboard()

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

    const staleSummaryText =
        'New messages have been added since this summary was generated. You can refresh it below.'
    const summaryText = isSummaryStale ? staleSummaryText : summary?.content
    const copyText = [summaryText, outcome].filter(Boolean).join('\n\n')
    const copyItems: BubbleActionItem[] = [
        {
            id: 'copy',
            icon: <CopyButton text={copyText} />,
            tooltip: 'Copy message',
            compactLabel: 'Copy message',
            compactLeadingSlot: 'copy',
            isDisabled: isLoading || isOutcomeLoading || !copyText,
            onAction: () => copyToClipboard(copyText),
        },
    ]

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
                                    {staleSummaryText}
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
            <BubbleActions placement="left" items={copyItems} />
        </MessageBubble>
    )
}
