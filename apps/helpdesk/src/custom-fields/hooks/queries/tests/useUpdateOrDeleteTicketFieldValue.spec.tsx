import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockDeleteTicketCustomFieldHandler,
    mockUpdateTicketCustomFieldHandler,
    mockUpdateTicketCustomFieldResponse,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useUpdateOrDeleteTicketFieldValue } from '../useUpdateOrDeleteTicketFieldValue'

const server = setupServer()
const mockStore = configureMockStore([thunk])()
let queryClient = mockQueryClient()

const dataToMutate = {
    ticketId: 1,
    fieldId: 1,
}

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

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
    mockStore.clearActions()
})

afterAll(() => {
    server.close()
})

describe('useUpdateOrDeleteTicketFieldValue', () => {
    it('should not do any mutation if disabled', () => {
        const requests: Request[] = []
        server.use(
            mockUpdateTicketCustomFieldHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(mockUpdateTicketCustomFieldResponse())
            }).handler,
            mockDeleteTicketCustomFieldHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(undefined)
            }).handler,
        )

        const { result } = renderHook(
            () =>
                useUpdateOrDeleteTicketFieldValue(undefined, {
                    isDisabled: true,
                }),
            { wrapper: createWrapper() },
        )

        result.current.mutate(dataToMutate)

        expect(requests).toHaveLength(0)
    })

    it('should call delete mutation when no value is provided', async () => {
        const deleteMock = mockDeleteTicketCustomFieldHandler()
        const waitForDeleteRequest = deleteMock.waitForRequest(server)
        server.use(
            deleteMock.handler,
            mockUpdateTicketCustomFieldHandler().handler,
        )

        const { result } = renderHook(
            () => useUpdateOrDeleteTicketFieldValue(),
            { wrapper: createWrapper() },
        )

        act(() => {
            result.current.mutate(dataToMutate)
        })

        await waitForDeleteRequest((request) => {
            const pathname = new URL(request.url).pathname

            expect(pathname).toContain(String(dataToMutate.ticketId))
            expect(pathname).toContain(String(dataToMutate.fieldId))
        })
    })

    it('should call update mutation with passed params when a value exists', async () => {
        const updateMock = mockUpdateTicketCustomFieldHandler(async () =>
            HttpResponse.json(mockUpdateTicketCustomFieldResponse()),
        )
        const waitForUpdateRequest = updateMock.waitForRequest(server)
        server.use(
            updateMock.handler,
            mockDeleteTicketCustomFieldHandler().handler,
        )

        const { result } = renderHook(
            () => useUpdateOrDeleteTicketFieldValue(),
            { wrapper: createWrapper() },
        )

        act(() => {
            result.current.mutate({ ...dataToMutate, value: 'foo' })
        })

        await waitForUpdateRequest(async (request) => {
            const pathname = new URL(request.url).pathname

            expect(pathname).toContain(String(dataToMutate.ticketId))
            expect(pathname).toContain(String(dataToMutate.fieldId))
            expect(await request.json()).toBe('foo')
        })
    })

    it('should wrap strings before calling mutation to ensure a string is not casted into number', async () => {
        const updateMock = mockUpdateTicketCustomFieldHandler(async () =>
            HttpResponse.json(mockUpdateTicketCustomFieldResponse()),
        )
        const waitForUpdateRequest = updateMock.waitForRequest(server)
        server.use(updateMock.handler)

        const { result } = renderHook(
            () => useUpdateOrDeleteTicketFieldValue(),
            { wrapper: createWrapper() },
        )

        act(() => {
            result.current.mutate({
                fieldId: 1,
                ticketId: 1,
                value: '1',
            })
        })

        await waitForUpdateRequest(async (request) => {
            expect(await request.json()).toBe('1')
        })
    })

    it('should accept overrides as first param and pass them to the mutation query', async () => {
        const onSuccess = jest.fn()
        const updateMock = mockUpdateTicketCustomFieldHandler(async () =>
            HttpResponse.json(mockUpdateTicketCustomFieldResponse()),
        )
        server.use(updateMock.handler)
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(
            () => useUpdateOrDeleteTicketFieldValue({ onSuccess }),
            { wrapper: createWrapper() },
        )

        act(() => {
            result.current.mutate({ ...dataToMutate, value: 'foo' })
        })

        await waitFor(() => expect(onSuccess).toHaveBeenCalled())
        expect(invalidateQueryMock).not.toHaveBeenCalled()
    })

    it('should invalidate proper query data on success if not provided with another success handler', async () => {
        server.use(mockUpdateTicketCustomFieldHandler().handler)
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(
            () => useUpdateOrDeleteTicketFieldValue(),
            { wrapper: createWrapper() },
        )

        act(() => {
            result.current.mutate({ ...dataToMutate, value: 'foo' })
        })

        await waitFor(() =>
            expect(invalidateQueryMock).toHaveBeenLastCalledWith({
                queryKey: queryKeys.tickets.listTicketCustomFields(
                    dataToMutate.ticketId,
                ),
            }),
        )
    })

    it.each([true, false])(
        'should provide a onError param that calls the notify action even if an onError param is provided (%s)',
        async (useResponseError) => {
            const onError = jest.fn()
            server.use(
                mockUpdateTicketCustomFieldHandler(async () =>
                    HttpResponse.json(
                        (useResponseError
                            ? { error: { msg: 'Unauthorized' } }
                            : { message: 'fooloulou' }) as never,
                        { status: useResponseError ? 403 : 500 },
                    ),
                ).handler,
            )

            const { result } = renderHook(
                () => useUpdateOrDeleteTicketFieldValue({ onError }),
                { wrapper: createWrapper() },
            )

            act(() => {
                result.current.mutate({ ...dataToMutate, value: 'foo' })
            })

            await waitFor(() => expect(onError).toHaveBeenCalled())
            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        status: NotificationStatus.Error,
                        message: useResponseError
                            ? 'Unauthorized'
                            : 'Failed to update ticket field value. Please try again in a few seconds.',
                    },
                },
            ])
        },
    )

    it('should update the prediction value when the value is mutated', async () => {
        server.use(
            mockUpdateTicketCustomFieldHandler(async () =>
                HttpResponse.json(
                    mockUpdateTicketCustomFieldResponse({
                        field: ticketDropdownFieldDefinition as never,
                        value: undefined,
                        prediction: {
                            predicted: 'Subscription::Cancel',
                            confidence: 80,
                            display: true,
                            confirmed: false,
                            modified: false,
                        },
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () => useUpdateOrDeleteTicketFieldValue(),
            { wrapper: createWrapper() },
        )

        act(() => {
            result.current.mutate({ ...dataToMutate, value: 'foo' })
        })

        await waitFor(() =>
            expect(mockStore.getActions()).toContainEqual({
                payload: {
                    id: ticketDropdownFieldDefinition.id,
                    prediction: {
                        predicted: 'Subscription::Cancel',
                        confidence: 80,
                        display: true,
                        confirmed: false,
                        modified: false,
                    },
                },
                type: 'UPDATE_CUSTOM_FIELD_PREDICTION',
            }),
        )
    })
})
