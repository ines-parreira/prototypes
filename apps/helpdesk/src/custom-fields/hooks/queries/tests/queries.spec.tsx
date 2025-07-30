import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { OBJECT_TYPES } from 'custom-fields/constants'
import {
    useCreateCustomField,
    useDeleteCustomFieldValue,
    useGetCustomFieldDefinition,
    useGetCustomFieldDefinitions,
    useGetCustomFieldValues,
    useUpdateCustomField,
    useUpdateCustomFields,
    useUpdateCustomFieldValue,
    useUpdatePartialCustomField,
} from 'custom-fields/hooks/queries/queries'
import { CustomFieldInput, PartialCustomFieldWithId } from 'custom-fields/types'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import { ticketInputFieldDefinition } from 'fixtures/customField'
import client from 'models/api/resources'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

const mockedServer = new MockAdapter(client)
const queryClient = mockQueryClient()

describe('queries.spec.tsx', () => {
    beforeEach(() => {
        mockedServer.reset()
        queryClient.clear()
    })

    describe('useGetCustomFieldDefinitions', () => {
        const response = apiListCursorPaginationResponse([
            ticketInputFieldDefinition,
        ])

        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer.onGet('/api/custom-fields/').reply(200, response)
            const { result } = renderHook(
                () =>
                    useGetCustomFieldDefinitions({
                        archived: false,
                        object_type: 'Ticket',
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data?.data).toStrictEqual(response)
        })

        it('should fail and return proper error', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/custom-fields')
                .reply(404, { message: 'error' })
            const { result } = renderHook(
                () =>
                    useGetCustomFieldDefinitions({
                        archived: false,
                        object_type: 'Ticket',
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
                expect(result.current.error).toBeDefined()
            })
        })
    })

    describe('useGetCustomFieldDefinition', () => {
        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/custom-fields/123')
                .reply(200, ticketInputFieldDefinition)
            const { result } = renderHook(
                () => useGetCustomFieldDefinition(123),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data?.data).toStrictEqual(
                ticketInputFieldDefinition,
            )
        })

        it('should fail and return proper error', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/custom-fields/123')
                .reply(404, { message: 'error' })

            const { result } = renderHook(
                () => useGetCustomFieldDefinition(123),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
                expect(result.current.error).toBeDefined()
            })
        })
    })

    describe('useCreateCustomField', () => {
        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onPost(`/api/custom-fields`)
                .reply(200, ticketInputFieldDefinition)

            const { result } = renderHook(() => useCreateCustomField(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            const dataToMutate: CustomFieldInput = ticketInputFieldDefinition

            act(() => {
                result.current.mutate([dataToMutate])
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
            expect(result.current.data?.data).toEqual(
                ticketInputFieldDefinition,
            )
        })
    })

    describe('useUpdateCustomField', () => {
        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onPut(`/api/custom-fields/${ticketInputFieldDefinition.id}`)
                .reply(200, ticketInputFieldDefinition)

            const { result } = renderHook(() => useUpdateCustomField(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            const dataToMutate: CustomFieldInput = ticketInputFieldDefinition

            act(() => {
                result.current.mutate([
                    ticketInputFieldDefinition.id,
                    dataToMutate,
                ])
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
            expect(result.current.data?.data).toEqual(
                ticketInputFieldDefinition,
            )
        })
    })

    describe('useUpdateCustomFields', () => {
        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onPut(`/api/custom-fields`)
                .reply(200, [ticketInputFieldDefinition])

            const { result } = renderHook(() => useUpdateCustomFields(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            const dataToMutate: PartialCustomFieldWithId[] = [
                { id: 1, priority: 1 },
            ]

            act(() => {
                result.current.mutate([dataToMutate])
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
            expect(result.current.data?.data).toEqual([
                ticketInputFieldDefinition,
            ])
        })
    })

    describe('useUpdatePartialCustomField', () => {
        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onPut(`/api/custom-fields/${ticketInputFieldDefinition.id}`)
                .reply(200, ticketInputFieldDefinition)

            const { result } = renderHook(() => useUpdatePartialCustomField(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            act(() => {
                result.current.mutate([
                    ticketInputFieldDefinition.id,
                    { deactivated_datetime: null },
                ])
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
            expect(result.current.data?.data).toEqual(
                ticketInputFieldDefinition,
            )
        })
    })

    describe('useGetCustomFieldValues', () => {
        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onGet(
                    `/api/tickets/${ticketInputFieldDefinition.id}/custom-fields`,
                )
                .reply(200, [
                    { field: ticketInputFieldDefinition, value: 'ok' },
                ])

            const { result } = renderHook(
                () =>
                    useGetCustomFieldValues({
                        holderId: ticketInputFieldDefinition.id,
                        object_type: OBJECT_TYPES.TICKET,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
            expect(result.current.data?.data).toEqual([
                {
                    field: ticketInputFieldDefinition,
                    value: 'ok',
                },
            ])
        })

        it("should adapt if object_type is 'Customer'", async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onGet(
                    `/api/customers/${ticketInputFieldDefinition.id}/custom-fields`,
                )
                .reply(200, [
                    { field: ticketInputFieldDefinition, value: 'ok' },
                ])

            const { result } = renderHook(
                () =>
                    useGetCustomFieldValues({
                        holderId: ticketInputFieldDefinition.id,
                        object_type: OBJECT_TYPES.CUSTOMER,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
        })

        it('should fail and return proper error', async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onGet(
                    `/api/tickets/${ticketInputFieldDefinition.id}/custom-fields`,
                )
                .reply(404, { message: 'error' })

            const { result } = renderHook(
                () =>
                    useGetCustomFieldValues({
                        holderId: ticketInputFieldDefinition.id,
                        object_type: OBJECT_TYPES.TICKET,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
                expect(result.current.error).toBeDefined()
            })
        })
    })

    describe('useUpdateCustomFieldValue', () => {
        const ticketId = 123
        const fieldValue = 'foo'

        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onPut(
                    `/api/tickets/${ticketId}/custom-fields/${ticketInputFieldDefinition.id}`,
                )
                .reply(200, {
                    field: ticketInputFieldDefinition,
                    value: fieldValue,
                })

            const { result } = renderHook(() => useUpdateCustomFieldValue(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            act(() => {
                result.current.mutate([
                    {
                        fieldType: 'Ticket',
                        holderId: ticketId,
                        fieldId: ticketInputFieldDefinition.id,
                        value: fieldValue,
                    },
                ])
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
            expect(result.current.data?.data.value).toEqual(fieldValue)
        })
    })

    describe('useDeleteCustomFieldValue', () => {
        const ticketId = 123

        it('should succeed and not return data', async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onDelete(
                    `/api/tickets/${ticketId}/custom-fields/${ticketInputFieldDefinition.id}`,
                )
                .reply(204)

            const { result } = renderHook(() => useDeleteCustomFieldValue(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            act(() => {
                result.current.mutate([
                    {
                        fieldType: 'Ticket',
                        holderId: ticketId,
                        fieldId: ticketInputFieldDefinition.id,
                    },
                ])
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(undefined)
        })
    })
})
