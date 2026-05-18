import {
    MessageBubbleRow,
    TicketThreadEventAuthor,
    TicketThreadEventContainer,
    TicketThreadEventDateTime,
} from '@repo/ticket-thread'

import { Box, Icon, Text } from '@gorgias/axiom'
import type { TicketSummary } from '@gorgias/helpdesk-types'

import { TicketSummaryBubble } from './TicketSummaryBubble'

type TicketThreadSummarySectionProps = {
    summary: TicketSummary | null | undefined
    isLoading: boolean
    errorMessage: string
    isRetriable: boolean
    requestSummary: () => void
}

export function TicketThreadSummarySection({
    summary,
    isLoading,
    errorMessage,
    isRetriable,
    requestSummary,
}: TicketThreadSummarySectionProps) {
    return (
        <Box
            width="100%"
            flexDirection="column"
            paddingLeft="md"
            paddingRight="md"
        >
            {!isLoading && !errorMessage && summary?.triggered_by != null && (
                <TicketThreadEventContainer>
                    <Icon name="ai-ticket-summary" size="sm" />
                    <Text size="sm">Ticket summary was generated</Text>
                    <TicketThreadEventAuthor authorId={summary.triggered_by} />
                    <TicketThreadEventDateTime
                        datetime={
                            summary.updated_datetime || summary.created_datetime
                        }
                    />
                </TicketThreadEventContainer>
            )}
            <MessageBubbleRow>
                <TicketSummaryBubble
                    summary={summary}
                    isLoading={isLoading}
                    errorMessage={errorMessage}
                    isRetriable={isRetriable}
                    requestSummary={requestSummary}
                />
            </MessageBubbleRow>
        </Box>
    )
}
