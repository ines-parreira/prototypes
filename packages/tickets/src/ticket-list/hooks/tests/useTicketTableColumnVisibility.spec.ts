import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetViewHandler,
    mockGetViewResponse,
    mockUpdateViewHandler,
    mockUpdateViewResponse,
} from '@gorgias/helpdesk-mocks'
import { ViewField } from '@gorgias/helpdesk-types'

import { createTestQueryClient, renderHook } from '../../../tests/render.utils'
import { useTicketTableColumnVisibility } from '../useTicketTableColumnVisibility'

const viewId = 123

const mockGetView = mockGetViewHandler(async () =>
    HttpResponse.json(
        mockGetViewResponse({
            id: viewId,
            fields: undefined,
        }),
    ),
)

const mockUpdateView = mockUpdateViewHandler(async () =>
    HttpResponse.json(
        mockUpdateViewResponse({
            id: viewId,
        }),
    ),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockGetView.handler, mockUpdateView.handler)
})

afterEach(() => {
    server.resetHandlers()
    vi.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('useTicketTableColumnVisibility', () => {
    it('returns all columns when the view has no saved fields', async () => {
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(result.current.defaultVisibleColumns).toEqual([
                'subject',
                'customer',
                'assignee',
                'status',
                'last_message_datetime',
                'tags',
                'priority',
                'assignee_team',
                'integrations',
                'id',
                'language',
                'channel',
                'created_datetime',
                'updated_datetime',
                'last_received_message_datetime',
                'closed',
                'snooze',
            ])
        })
    })

    it('maps view fields to column ids and prepends the mandatory subject column', async () => {
        server.use(
            mockGetViewHandler(async () =>
                HttpResponse.json(
                    mockGetViewResponse({
                        id: viewId,
                        fields: [ViewField.Customer, ViewField.Created],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(result.current.defaultVisibleColumns).toEqual([
                'subject',
                'customer',
                'created_datetime',
            ])
        })
    })

    it('does not persist visibility changes when the mandatory subject column is missing', async () => {
        let wasUpdateViewCalled = false

        server.use(
            mockUpdateViewHandler(async () => {
                wasUpdateViewCalled = true
                return HttpResponse.json(
                    mockUpdateViewResponse({
                        id: viewId,
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(result.current.defaultVisibleColumns).toContain('subject')
        })

        act(() => {
            result.current.onChange(['customer', 'priority'])
        })

        await waitFor(() => {
            expect(wasUpdateViewCalled).toBe(false)
        })
    })

    it('persists mapped fields and invalidates the view query on success', async () => {
        const queryClient = createTestQueryClient()
        const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
        const waitForUpdateViewRequest = mockUpdateView.waitForRequest(server)

        const { result } = renderHook(
            () => useTicketTableColumnVisibility(viewId),
            { queryClient },
        )

        await waitFor(() => {
            expect(result.current.defaultVisibleColumns).toContain('subject')
        })

        act(() => {
            result.current.onChange([
                'subject',
                'customer',
                'priority',
                'created_datetime',
            ])
        })

        await waitForUpdateViewRequest(async (request) => {
            expect(await request.json()).toEqual({
                fields: [
                    ViewField.Subject,
                    ViewField.Customer,
                    ViewField.Priority,
                    ViewField.Created,
                ],
            })
        })

        await waitFor(() => {
            expect(invalidateQueries).toHaveBeenCalledWith(expect.anything())
        })
    })
})
