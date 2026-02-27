import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetViewHandler,
    mockGetViewResponse,
} from '@gorgias/helpdesk-mocks'
import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../../tests/render.utils'
import { useSortOrder } from '../useSortOrder'

const viewId = 123

const mockGetView = mockGetViewHandler(async () =>
    HttpResponse.json(
        mockGetViewResponse({
            id: viewId,
            order_by: 'updated_datetime',
            order_dir: 'asc',
        }),
    ),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockGetView.handler)
    testAppQueryClient.clear()
    localStorage.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useSortOrder', () => {
    it('returns the sort order configured on the view', async () => {
        const { result } = renderHook(() => useSortOrder(viewId))

        await waitFor(() => {
            expect(result.current[0]).toBe(
                ListViewItemsUpdatesOrderBy.UpdatedDatetimeAsc,
            )
        })
    })

    it('falls back to last_message_datetime:asc when the view has no valid sort order', async () => {
        server.use(
            mockGetViewHandler(async () =>
                HttpResponse.json(
                    mockGetViewResponse({
                        id: viewId,
                        order_by: undefined,
                        order_dir: undefined,
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useSortOrder(viewId))

        await waitFor(() => {
            expect(result.current[0]).toBe(
                ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
            )
        })
    })

    it('returns the localStorage override over the view configured sort order', async () => {
        localStorage.setItem(
            'ticket-list-view-sort-orders',
            JSON.stringify({
                [viewId]: ListViewItemsUpdatesOrderBy.PriorityDesc,
            }),
        )

        const { result } = renderHook(() => useSortOrder(viewId))

        await waitFor(() => {
            expect(result.current[0]).toBe(
                ListViewItemsUpdatesOrderBy.PriorityDesc,
            )
        })
    })

    it('does not use a localStorage override for a different viewId', async () => {
        localStorage.setItem(
            'ticket-list-view-sort-orders',
            JSON.stringify({ 999: ListViewItemsUpdatesOrderBy.PriorityDesc }),
        )

        const { result } = renderHook(() => useSortOrder(viewId))

        await waitFor(() => {
            expect(result.current[0]).toBe(
                ListViewItemsUpdatesOrderBy.UpdatedDatetimeAsc,
            )
        })
    })

    it('setSortOrder updates the returned sort order', async () => {
        const { result } = renderHook(() => useSortOrder(viewId))

        await waitFor(() => {
            expect(result.current[0]).toBe(
                ListViewItemsUpdatesOrderBy.UpdatedDatetimeAsc,
            )
        })

        act(() => {
            result.current[1](ListViewItemsUpdatesOrderBy.CreatedDatetimeDesc)
        })

        await waitFor(() => {
            expect(result.current[0]).toBe(
                ListViewItemsUpdatesOrderBy.CreatedDatetimeDesc,
            )
        })
    })
})
