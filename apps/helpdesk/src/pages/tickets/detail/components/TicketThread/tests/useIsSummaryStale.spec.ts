import { renderHook } from '@repo/testing'

import type { TicketSummary } from '@gorgias/helpdesk-types'

import { useIsSummaryStale } from '../useIsSummaryStale'

const summary: TicketSummary = {
    content: 'The customer asked about a delayed order.',
    created_datetime: '2024-01-05T10:00:00Z',
    updated_datetime: '',
    triggered_by: 1,
}

describe('useIsSummaryStale', () => {
    it('returns false when summary is null', () => {
        const { result } = renderHook(() =>
            useIsSummaryStale(null, '2024-01-10T00:00:00Z'),
        )

        expect(result.current).toBe(false)
    })

    it('returns false when summary has no content', () => {
        const { result } = renderHook(() =>
            useIsSummaryStale(
                { ...summary, content: '' },
                '2024-01-10T00:00:00Z',
            ),
        )

        expect(result.current).toBe(false)
    })

    it('returns false when latestMessageDatetime is null', () => {
        const { result } = renderHook(() => useIsSummaryStale(summary, null))

        expect(result.current).toBe(false)
    })

    it('returns false when all messages predate the summary', () => {
        const { result } = renderHook(() =>
            useIsSummaryStale(summary, '2024-01-04T09:59:59Z'),
        )

        expect(result.current).toBe(false)
    })

    it('returns true when a message was sent after the summary was created', () => {
        const { result } = renderHook(() =>
            useIsSummaryStale(summary, '2024-01-06T10:00:00Z'),
        )

        expect(result.current).toBe(true)
    })

    it('uses updated_datetime over created_datetime for the staleness comparison', () => {
        const updatedSummary: TicketSummary = {
            ...summary,
            updated_datetime: '2024-01-08T10:00:00Z',
        }

        // message is after created_datetime but before updated_datetime → not stale
        const { result } = renderHook(() =>
            useIsSummaryStale(updatedSummary, '2024-01-06T10:00:00Z'),
        )

        expect(result.current).toBe(false)
    })

    it('returns true when a message came after the updated_datetime', () => {
        const updatedSummary: TicketSummary = {
            ...summary,
            updated_datetime: '2024-01-08T10:00:00Z',
        }

        const { result } = renderHook(() =>
            useIsSummaryStale(updatedSummary, '2024-01-09T00:00:00Z'),
        )

        expect(result.current).toBe(true)
    })
})
