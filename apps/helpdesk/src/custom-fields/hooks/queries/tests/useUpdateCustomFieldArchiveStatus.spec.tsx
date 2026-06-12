import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockUpdateCustomFieldHandler,
    mockUpdateCustomFieldResponse,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useUpdateCustomFieldArchiveStatus } from '../useUpdateCustomFieldArchiveStatus'

const server = setupServer()
const mockStore = configureMockStore([thunk])()
let queryClient = mockQueryClient()

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
    jest.useFakeTimers().setSystemTime(42)
})

afterEach(() => {
    jest.useRealTimers()
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useUpdateCustomFieldArchiveStatus', () => {
    it('should accept an id param and pass it to the mutation query with proper data structure', async () => {
        const updateCustomFieldMock = mockUpdateCustomFieldHandler(async () =>
            HttpResponse.json(
                mockUpdateCustomFieldResponse(ticketDropdownFieldDefinition),
            ),
        )
        const waitForUpdateCustomFieldRequest =
            updateCustomFieldMock.waitForRequest(server)
        server.use(updateCustomFieldMock.handler)

        const { result } = renderHook(
            () =>
                useUpdateCustomFieldArchiveStatus(
                    ticketDropdownFieldDefinition.id,
                    ticketDropdownFieldDefinition.object_type,
                ),
            { wrapper: createWrapper() },
        )

        await act(async () => {
            await result.current.mutateAsync(true)
        })

        await waitForUpdateCustomFieldRequest(async (request) => {
            expect(new URL(request.url).pathname).toContain(
                String(ticketDropdownFieldDefinition.id),
            )
            expect(await request.json()).toEqual({
                deactivated_datetime: '1970-01-01T00:00:00.042Z',
            })
        })
    })

    it.each([
        {
            objectType: OBJECT_TYPES.TICKET,
            archived: true,
            message: `Ticket field has been successfully archived.`,
        },
        {
            objectType: OBJECT_TYPES.CUSTOMER,
            archived: true,
            message: `Customer field has been successfully archived.`,
        },
        {
            objectType: OBJECT_TYPES.TICKET,
            archived: false,
            message: `Ticket field has been successfully moved to active.`,
        },
        {
            objectType: OBJECT_TYPES.CUSTOMER,
            archived: false,
            message: `Customer field has been successfully moved to active.`,
        },
    ])(
        'should dispatch success notification on success and invalidate proper query data',
        async ({ objectType, archived, message }) => {
            const fieldDefinition = {
                ...ticketDropdownFieldDefinition,
                object_type: objectType,
            }
            server.use(
                mockUpdateCustomFieldHandler(async () =>
                    HttpResponse.json(
                        mockUpdateCustomFieldResponse(fieldDefinition),
                    ),
                ).handler,
            )
            const invalidateQueryMock = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )
            const { result } = renderHook(
                () =>
                    useUpdateCustomFieldArchiveStatus(
                        fieldDefinition.id,
                        fieldDefinition.object_type,
                    ),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.mutateAsync(archived)
            })

            expect(invalidateQueryMock).toHaveBeenLastCalledWith({
                queryKey: queryKeys.customFields.all(),
            })
            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        message,
                        status: NotificationStatus.Success,
                    },
                },
            ])
        },
    )

    it('should dispatch failure notification on error', async () => {
        server.use(
            mockUpdateCustomFieldHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to update custom field' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useUpdateCustomFieldArchiveStatus(
                    ticketDropdownFieldDefinition.id,
                    ticketDropdownFieldDefinition.object_type,
                ),
            { wrapper: createWrapper() },
        )

        await act(async () => {
            await expect(result.current.mutateAsync(true)).rejects.toBeDefined()
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
