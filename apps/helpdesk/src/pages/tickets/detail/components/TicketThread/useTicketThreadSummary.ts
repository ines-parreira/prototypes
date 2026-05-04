import { useTicketSummary } from '@repo/ticket-thread'
import type { TicketThreadItemType } from '@repo/ticket-thread'

import { useCanSummarize } from './useCanSummarize'
import { useIsSummaryStale } from './useIsSummaryStale'
import { useTicketThreadMessageStats } from './useTicketThreadMessageStats'

export const useTicketThreadSummary = ({
    ticketId,
    initialSummary,
    ticketThreadItems,
    isMessagesLoading,
}: {
    ticketId: number
    initialSummary: ReturnType<typeof useTicketSummary>['summary']
    ticketThreadItems: TicketThreadItemType[]
    isMessagesLoading: boolean
}) => {
    const { summary, isLoading, errorMessage, isRetriable, requestSummary } =
        useTicketSummary({
            ticketId,
            initialSummary,
        })

    const {
        messageCount,
        messagesAfterHandover,
        hasHandoverMessage,
        hasInternalMessages,
        hasExternalMessages,
        latestMessageDatetime,
    } = useTicketThreadMessageStats(ticketThreadItems)

    const isSummaryStale = useIsSummaryStale(summary, latestMessageDatetime)

    const canSummarize = useCanSummarize({
        hasHandoverMessage,
        messagesAfterHandover,
        messageCount,
        hasInternalMessages,
        hasExternalMessages,
    })

    const showButton =
        canSummarize &&
        !isLoading &&
        !errorMessage &&
        (!summary?.content || isSummaryStale)

    const showSummaryBubble =
        !isMessagesLoading &&
        (isLoading ||
            (Boolean(summary?.content) && !isSummaryStale) ||
            Boolean(errorMessage))

    const summarizeCount = hasHandoverMessage
        ? messagesAfterHandover
        : messageCount

    return {
        summary,
        isLoading,
        errorMessage,
        isRetriable,
        requestSummary,
        showButton,
        showSummaryBubble,
        summarizeCount,
    }
}
