import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockUpdateCustomFieldsHandler,
    mockUpdateCustomFieldsResponse,
} from '@gorgias/helpdesk-mocks'
import type { UpdateCustomFieldItem } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'

import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useUpdateCustomFieldDefinitions } from '../useUpdateCustomFieldDefinitions'

const server = setupServer()
const mockStore = configureMockStore([thunk])()
let queryClient = mockQueryClient()
const listParams = { archived: false, object_type: 'Ticket' } as const
const queryKey = queryKeys.customFields.listCustomFields(listParams)

const createWrapper = () => {
    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore}>{children}</Provider>
        </QueryClientProvider>
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    mockStore.clearActions()
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useUpdateCustomFieldDefinitions', () => {
    it('should cancel previous query on update', async () => {
        server.use(mockUpdateCustomFieldsHandler().handler)
        const cancelQueryMock = jest.spyOn(queryClient, 'cancelQueries')
        const { result } = renderHook(
            () => useUpdateCustomFieldDefinitions(listParams),
            { wrapper: createWrapper() },
        )

        await act(async () => {
            await result.current.mutateAsync({
                data: [ticketDropdownFieldDefinition as UpdateCustomFieldItem],
            })
        })

        expect(cancelQueryMock).toHaveBeenLastCalledWith({ queryKey })
    })

    it('should optimistically update query on update and sort fields if priority changed', async () => {
        const ticketDropdownFieldDefinitions = apiListCursorPaginationResponse([
            { ...ticketDropdownFieldDefinition, id: 420, priority: 1 },
            { ...ticketDropdownFieldDefinition, id: 421, priority: 2 },
            { ...ticketDropdownFieldDefinition, id: 422, priority: 3 },
        ])
        server.use(
            mockUpdateCustomFieldsHandler(async () =>
                HttpResponse.json(mockUpdateCustomFieldsResponse()),
            ).handler,
        )

        const { result } = renderHook(
            () => useUpdateCustomFieldDefinitions(listParams),
            { wrapper: createWrapper() },
        )
        queryClient.setQueryData(
            queryKey,
            axiosSuccessResponse(ticketDropdownFieldDefinitions),
        )

        await act(async () => {
            await result.current.mutateAsync({
                data: [
                    { id: 422, priority: 1 },
                    { id: 420, priority: 2 },
                    { id: 421, priority: 3 },
                ],
            })
        })

        const results = queryClient.getQueryData(queryKey) as ReturnType<
            typeof axiosSuccessResponse<typeof ticketDropdownFieldDefinitions>
        >
        const data = results.data.data

        expect([
            [data[0].id, data[0].priority],
            [data[1].id, data[1].priority],
            [data[2].id, data[2].priority],
        ]).toEqual([
            [421, 3],
            [420, 2],
            [422, 1],
        ])
    })

    it('should invalidate proper query on settled', async () => {
        server.use(mockUpdateCustomFieldsHandler().handler)
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        const { result } = renderHook(
            () => useUpdateCustomFieldDefinitions(listParams),
            { wrapper: createWrapper() },
        )

        await act(async () => {
            await result.current.mutateAsync({
                data: [ticketDropdownFieldDefinition as UpdateCustomFieldItem],
            })
        })

        await waitFor(() =>
            expect(invalidateQueryMock).toHaveBeenLastCalledWith({
                queryKey: queryKeys.customFields.all(),
            }),
        )
    })

    it('should dispatch failure notification on error', async () => {
        server.use(
            mockUpdateCustomFieldsHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to update custom fields' } as never,
                    { status: 500 },
                ),
            ).handler,
        )
        const { result } = renderHook(
            () => useUpdateCustomFieldDefinitions(listParams),
            { wrapper: createWrapper() },
        )

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    data: [
                        ticketDropdownFieldDefinition as UpdateCustomFieldItem,
                    ],
                }),
            ).rejects.toBeDefined()
        })

        await waitFor(() =>
            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        status: NotificationStatus.Error,
                    },
                },
            ]),
        )
    })
})
