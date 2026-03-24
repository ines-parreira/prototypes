import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    mockListViewItemsHandler,
    mockListViewItemsUpdatesHandler,
    mockTicketCompact,
} from '@gorgias/helpdesk-mocks'
import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'
import type { ListViewItemsUpdatesOrderBy as ListViewItemsUpdatesOrderByType } from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import * as useSortOrderModule from '../../ticket-list/hooks/useSortOrder'
import * as useTicketsListModule from '../../ticket-list/hooks/useTicketsList'
import { useCachedTicketViewNavigation } from '../useCachedTicketViewNavigation'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

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

    it('should return undefined when not in a view context', () => {
        const useTicketsListSpy = vi.spyOn(
            useTicketsListModule,
            'useTicketsList',
        )

        const { result } = renderHook(() => useCachedTicketViewNavigation({}), {
            initialEntries: ['/app/ticket/123'],
            path: '/app/ticket/:ticketId',
        })

        expect(result.current).toBeUndefined()
        expect(useTicketsListSpy).toHaveBeenCalledWith(0, {
            params: undefined,
            enabled: false,
        })
    })

    it('should derive previous and next ticket ids from the tickets list', () => {
        vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
            tickets: [
                mockTicketCompact({ id: 122 }),
                mockTicketCompact({ id: 123 }),
                mockTicketCompact({ id: 124 }),
            ],
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: null,
            data: undefined,
            refetch: vi.fn(),
        })

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

    it('should use the tickets list for the active view even when another view contains the same ticket', () => {
        vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
            tickets: [
                mockTicketCompact({ id: 122 }),
                mockTicketCompact({ id: 123 }),
                mockTicketCompact({ id: 124 }),
            ],
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: null,
            data: undefined,
            refetch: vi.fn(),
        })

        const { result } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toMatchObject({
            previousTicketId: 122,
            nextTicketId: 124,
        })
    })

    it('should use the tickets list matching the current sort order for the active view', () => {
        vi.spyOn(useSortOrderModule, 'useSortOrder').mockReturnValue([
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
            vi.fn(),
        ])

        const useTicketsListSpy = vi
            .spyOn(useTicketsListModule, 'useTicketsList')
            .mockReturnValue({
                tickets: [
                    mockTicketCompact({ id: 122 }),
                    mockTicketCompact({ id: 123 }),
                    mockTicketCompact({ id: 124 }),
                ],
                fetchNextPage: vi.fn(),
                hasNextPage: false,
                isLoading: false,
                isFetching: false,
                isFetchingNextPage: false,
                error: null,
                data: undefined,
                refetch: vi.fn(),
            })

        const { result } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toMatchObject({
            previousTicketId: 122,
            nextTicketId: 124,
        })
        expect(useTicketsListSpy).toHaveBeenCalledWith(1, {
            params: {
                order_by: ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
            },
            enabled: true,
        })
    })

    it('should update to the new list when the sort order changes after mount', () => {
        const sortOrderState: {
            current: ListViewItemsUpdatesOrderByType
        } = {
            current: ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
        }

        vi.spyOn(useSortOrderModule, 'useSortOrder').mockImplementation(() => [
            sortOrderState.current,
            vi.fn(),
        ])

        vi.spyOn(useTicketsListModule, 'useTicketsList').mockImplementation(
            (_viewId, options) => ({
                tickets:
                    options?.params?.order_by ===
                    ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc
                        ? [
                              mockTicketCompact({ id: 222 }),
                              mockTicketCompact({ id: 123 }),
                              mockTicketCompact({ id: 224 }),
                          ]
                        : [
                              mockTicketCompact({ id: 122 }),
                              mockTicketCompact({ id: 123 }),
                              mockTicketCompact({ id: 124 }),
                          ],
                fetchNextPage: vi.fn(),
                hasNextPage: false,
                isLoading: false,
                isFetching: false,
                isFetchingNextPage: false,
                error: null,
                data: undefined,
                refetch: vi.fn(),
            }),
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

    it('should derive disabled previous state for the first loaded ticket', () => {
        vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
            tickets: [
                mockTicketCompact({ id: 123 }),
                mockTicketCompact({ id: 124 }),
            ],
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: null,
            data: undefined,
            refetch: vi.fn(),
        })

        const { result } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toMatchObject({
            shouldDisplay: true,
            previousTicketId: undefined,
            nextTicketId: 124,
            isPreviousEnabled: false,
            isNextEnabled: true,
        })
    })

    it('should derive previous and next ticket ids across multiple loaded pages', () => {
        vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
            tickets: [
                mockTicketCompact({ id: 121 }),
                mockTicketCompact({ id: 122 }),
                mockTicketCompact({ id: 123 }),
                mockTicketCompact({ id: 124 }),
            ],
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: null,
            data: undefined,
            refetch: vi.fn(),
        })

        const { result } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toMatchObject({
            shouldDisplay: true,
            previousTicketId: 122,
            nextTicketId: 124,
            isPreviousEnabled: true,
            isNextEnabled: true,
        })
    })

    it('should derive disabled next state for the last loaded ticket', () => {
        vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
            tickets: [
                mockTicketCompact({ id: 122 }),
                mockTicketCompact({ id: 123 }),
            ],
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: null,
            data: undefined,
            refetch: vi.fn(),
        })

        const { result } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toMatchObject({
            shouldDisplay: true,
            previousTicketId: 122,
            nextTicketId: undefined,
            isPreviousEnabled: true,
            isNextEnabled: false,
        })
    })

    it('should return undefined when the loaded list does not contain the ticket', () => {
        vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
            tickets: [
                mockTicketCompact({ id: 122 }),
                mockTicketCompact({ id: 124 }),
            ],
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: null,
            data: undefined,
            refetch: vi.fn(),
        })

        const { result } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toBeUndefined()
    })

    it('should start with legacy fallback and switch after the list query loads the current ticket', async () => {
        server.use(
            mockListViewItemsHandler(async () =>
                HttpResponse.json({
                    data: [
                        mockTicketCompact({ id: 122 }),
                        mockTicketCompact({ id: 123 }),
                        mockTicketCompact({ id: 124 }),
                    ],
                    meta: {
                        current_cursor: null,
                        next_items: null,
                        prev_items: null,
                    },
                    object: 'list',
                    uri: '/api/views/1/items/',
                } as any),
            ).handler,
            mockListViewItemsUpdatesHandler(async () =>
                HttpResponse.json({
                    data: [
                        { id: 122, updated_datetime: null, customer: {} },
                        { id: 123, updated_datetime: null, customer: {} },
                        { id: 124, updated_datetime: null, customer: {} },
                    ],
                    meta: {
                        current_cursor: null,
                        next_items: null,
                        prev_items: null,
                    },
                } as any),
            ).handler,
        )

        const { result } = renderHook(() =>
            useCachedTicketViewNavigation({
                viewId: 1,
                ticketId: 123,
            }),
        )

        expect(result.current).toBeUndefined()

        await waitFor(() => {
            expect(result.current).toMatchObject({
                previousTicketId: 122,
                nextTicketId: 124,
                isPreviousEnabled: true,
                isNextEnabled: true,
            })
        })
    })
})
