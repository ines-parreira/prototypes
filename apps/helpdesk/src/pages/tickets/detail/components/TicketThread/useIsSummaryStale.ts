import { useMemo } from 'react'

import type { TicketSummary } from '@gorgias/helpdesk-types'

export function useIsSummaryStale(
    summary: TicketSummary | null | undefined,
    latestMessageDatetime: string | null,
): boolean {
    return useMemo(() => {
        if (!summary?.content) return false
        const summaryDatetime =
            summary.updated_datetime || summary.created_datetime
        if (!summaryDatetime || !latestMessageDatetime) return false
        return new Date(latestMessageDatetime) > new Date(summaryDatetime)
    }, [summary, latestMessageDatetime])
}
