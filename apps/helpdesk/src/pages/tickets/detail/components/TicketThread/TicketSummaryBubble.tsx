import { useState } from 'react'

import {
    BubbleActions,
    CopyButton,
    MessageBubble,
    MessageHeaderContainer,
    MessageTimestamp,
} from '@repo/ticket-thread'
import type { BubbleActionItem } from '@repo/ticket-thread'
import { useCopyToClipboard } from '@gorgias/toolkit-react'

import { Box, Button, Icon, Skeleton, Text } from '@gorgias/axiom'
import type { TicketSummary } from '@gorgias/helpdesk-types'

type TicketSummaryBubbleProps = {
    summary: TicketSummary | null | undefined
    isLoading: boolean
    errorMessage?: string
    isRetriable?: boolean
    requestSummary?: () => void
}

export function TicketSummaryBubble({
    summary,
    isLoading,
    errorMessage,
    isRetriable,
    requestSummary,
}: TicketSummaryBubbleProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [, copyToClipboard] = useCopyToClipboard()

    if (!isLoading && !summary?.content && !errorMessage) return null

    const copyText = summary?.content ?? ''
    const copyItems: BubbleActionItem[] = [
        {
            id: 'copy',
            icon: <CopyButton text={copyText} />,
            tooltip: 'Copy message',
            compactLabel: 'Copy message',
            compactLeadingSlot: 'copy',
            isDisabled: isLoading || !copyText,
            onAction: () => copyToClipboard(copyText),
        },
    ]

    const summaryDatetime =
        summary?.updated_datetime || summary?.created_datetime

    return (
        <Box
            width="100%"
            flexDirection="column"
            alignItems="flex-end"
            paddingTop="xs"
            paddingBottom="xs"
        >
            <MessageBubble variant="ai-agent-handover" isGroupedMessage={true}>
                <MessageHeaderContainer>
                    <Box alignItems="center" gap="xs">
                        <Icon name="ai-ticket-summary" size="md" />
                        <Text
                            size="md"
                            color="content-neutral-default"
                            variant="bold"
                        >
                            Ticket summary
                        </Text>
                    </Box>
                    <Box alignItems="center" gap="xxs">
                        {summaryDatetime && (
                            <MessageTimestamp
                                createdDatetime={summaryDatetime}
                            />
                        )}
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
                    <>
                        {isLoading ? (
                            <Box flexDirection="column" gap="xxs">
                                <Skeleton />
                                <Skeleton />
                                <Skeleton />
                            </Box>
                        ) : errorMessage ? (
                            <Box flexDirection="column" gap="xxs">
                                <Box marginBottom="xs">
                                    <Text
                                        size="sm"
                                        color="content-neutral-secondary"
                                    >
                                        {errorMessage}
                                    </Text>
                                </Box>
                                {isRetriable && requestSummary && (
                                    <div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            intent="regular"
                                            leadingSlot={
                                                <Icon
                                                    name="arrow-reload-alt-1"
                                                    size="sm"
                                                />
                                            }
                                            onClick={requestSummary}
                                        >
                                            Try again
                                        </Button>
                                    </div>
                                )}
                            </Box>
                        ) : (
                            <div style={{ whiteSpace: 'pre-line' }}>
                                <Text size="sm" color="content-neutral-default">
                                    {summary!.content}
                                </Text>
                            </div>
                        )}
                    </>
                )}
                <BubbleActions placement="left" items={copyItems} />
            </MessageBubble>
        </Box>
    )
}
