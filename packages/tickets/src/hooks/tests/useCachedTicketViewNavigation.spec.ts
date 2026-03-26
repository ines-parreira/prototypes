import type { InfiniteData } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { queryKeys } from '@gorgias/helpdesk-queries'
import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'
import type {
    ListViewItemsUpdatesOrderBy as ListViewItemsUpdatesOrderByType,
    TicketCompact,
} from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import * as useSortOrderModule from '../../ticket-list/hooks/useSortOrder'
import { useCachedTicketViewNavigation } from '../useCachedTicketViewNavigation'

function seedTicketsListCache(
    viewId: number,
    orderBy: ListViewItemsUpdatesOrderBy,
    tickets: TicketCompact[],
) {
    testAppQueryClient.setQueryData<
        InfiniteData<{ data?: Array<{ id?: number }> }>
    >(queryKeys.views.listViewItems(viewId, { order_by: orderBy }), {
        pages: [{ data: tickets }],
        pageParams: [undefined],
    })
}

describe('useCachedTicketViewNavigation', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.restoreAllMocks()
        testAppQueryClient.clear()
        vi.spyOn(useSortOrderModule, 'useSortOrder').mockReturnValue([
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
            vi.fn(),
        ])
    })

    it('returns undefined when not in a view context', () => {
        const { result } = renderHook(() => useCachedTicketViewNavigation({}), {
            initialEntries: ['/app/ticket/123'],
            path: '/app/ticket/:ticketId',
        })

        expect(result.current).toBeUndefined()
    })

    it('derives previous and next ticket ids from the cached list', () => {
        seedTicketsListCache(
            1,
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
            [
                { id: 122 } as TicketCompact,
                { id: 123 } as TicketCompact,
                { id: 124 } as TicketCompact,
            ],
        )

        const { result } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toMatchObject({
            shouldDisplay: true,
            shouldUseLegacyFunctions: false,
            previousTicketId: 122,
            nextTicketId: 124,
            isPreviousEnabled: true,
            isNextEnabled: true,
        })
    })

    it('returns undefined when the cached list does not contain the ticket', () => {
        seedTicketsListCache(
            1,
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
            [{ id: 122 } as TicketCompact, { id: 124 } as TicketCompact],
        )

        const { result } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toBeUndefined()
    })

    it('updates when the sort-order-specific cache changes after mount', () => {
        const sortOrderState: {
            current: ListViewItemsUpdatesOrderByType
        } = {
            current: ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
        }

        vi.spyOn(useSortOrderModule, 'useSortOrder').mockImplementation(() => [
            sortOrderState.current,
            vi.fn(),
        ])

        seedTicketsListCache(
            1,
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
            [
                { id: 122 } as TicketCompact,
                { id: 123 } as TicketCompact,
                { id: 124 } as TicketCompact,
            ],
        )
        seedTicketsListCache(
            1,
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
            [
                { id: 222 } as TicketCompact,
                { id: 123 } as TicketCompact,
                { id: 224 } as TicketCompact,
            ],
        )

        const { result, rerender } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toMatchObject({
            previousTicketId: 122,
            nextTicketId: 124,
        })

        sortOrderState.current =
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc
        rerender()

        expect(result.current).toMatchObject({
            previousTicketId: 222,
            nextTicketId: 224,
        })
    })

    it('reacts to cache updates without mounting a second tickets list hook', () => {
        seedTicketsListCache(
            1,
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
            [{ id: 123 } as TicketCompact, { id: 124 } as TicketCompact],
        )

        const { result } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toMatchObject({
            previousTicketId: undefined,
            nextTicketId: 124,
            isPreviousEnabled: false,
            isNextEnabled: true,
        })

        act(() => {
            seedTicketsListCache(
                1,
                ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
                [
                    { id: 122 } as TicketCompact,
                    { id: 123 } as TicketCompact,
                    { id: 124 } as TicketCompact,
                ],
            )
        })

        return waitFor(() => {
            expect(result.current).toMatchObject({
                previousTicketId: 122,
                nextTicketId: 124,
                isPreviousEnabled: true,
                isNextEnabled: true,
            })
        })
    })
})
