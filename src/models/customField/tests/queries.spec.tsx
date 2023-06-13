import MockAdapter from 'axios-mock-adapter'
import {renderHook, act} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'
import {Provider} from 'react-redux'
import React from 'react'

import client from 'models/api/resources'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {
    customFieldDefinitionKeys,
    useCreateCustomField,
    useDeleteCustomFieldValue,
    useGetCustomFieldDefinition,
    useGetCustomFieldDefinitions,
    useUpdateCustomField,
    useUpdateCustomFields,
    useUpdateCustomFieldStatus,
    useUpdateCustomFieldValue,
} from 'models/customField/queries'
import {
    ticketInputFieldDefinition,
    customFieldInputDefinition,
} from 'fixtures/customField'
import {NotificationStatus} from 'state/notifications/types'
import {ListParams} from 'models/customField/types'

const mockedServer = new MockAdapter(client)
const queryClient = createTestQueryClient()

describe('queries.spec.tsx', () => {
    beforeEach(async () => {
        mockedServer.reset()
        await queryClient.invalidateQueries()
    })

    describe('useGetCustomFieldDefinitions', () => {
        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/custom-fields/')
                .reply(200, {data: [ticketInputFieldDefinition]})
            const {result, waitFor} = renderHook(
                () =>
                    useGetCustomFieldDefinitions({
                        archived: false,
                        object_type: 'Ticket',
                    }),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toMatchSnapshot()
        })

        it('should fail and return proper error', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/custom-fields')
                .reply(404, {message: 'error'})
            const {result, waitFor} = renderHook(
                () =>
                    useGetCustomFieldDefinitions({
                        archived: false,
                        object_type: 'Ticket',
                    }),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
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
            const {result, waitFor} = renderHook(
                () => useGetCustomFieldDefinition(123),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toMatchSnapshot()
        })

        it('should fail and return proper error', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/custom-fields/123')
                .reply(404, {message: 'error'})

            const {result, waitFor} = renderHook(
                () => useGetCustomFieldDefinition(123),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
                expect(result.current.error).toBeDefined()
            })
        })
    })

    describe('useCreateCustomField', () => {
        it('successful query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )
            mockedServer
                .onPost('/api/custom-fields')
                .reply(200, ticketInputFieldDefinition)
            const {result, waitFor} = renderHook(() => useCreateCustomField(), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            act(() => {
                result.current.mutate(customFieldInputDefinition)
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
                expect(result.current.data).toMatchSnapshot()
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: customFieldDefinitionKeys.all(),
                })
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message: 'Ticket field created successfully.',
                            status: NotificationStatus.Success,
                        },
                    },
                ])
            })

            invalidateQueriesSpy.mockRestore()
        })

        it('failure query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )
            mockedServer.onPost('/api/custom-fields').reply(400, {
                error: {msg: 'foo error'},
            })
            const {result, waitFor} = renderHook(() => useCreateCustomField(), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            act(() => {
                result.current.mutate(customFieldInputDefinition)
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
                expect(result.current.error).toBeDefined()
                expect(invalidateQueriesSpy).toHaveBeenCalledTimes(0)
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message: 'foo error',
                            status: NotificationStatus.Error,
                        },
                    },
                ])
            })

            invalidateQueriesSpy.mockRestore()
        })
    })

    describe('useUpdateCustomField', () => {
        it('successful query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )
            mockedServer
                .onPut('/api/custom-fields/123')
                .reply(200, ticketInputFieldDefinition)
            const {result, waitFor} = renderHook(
                () => useUpdateCustomField(123),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

            act(() => {
                result.current.mutate(customFieldInputDefinition)
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
                expect(result.current.data).toMatchSnapshot()
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: customFieldDefinitionKeys.all(),
                })
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message: 'Ticket field updated successfully.',
                            status: NotificationStatus.Success,
                        },
                    },
                ])
            })

            invalidateQueriesSpy.mockRestore()
        })

        it('failure query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )
            mockedServer.onPut('/api/custom-fields/123').reply(400, {
                error: {msg: 'foo error'},
            })
            const {result, waitFor} = renderHook(
                () => useUpdateCustomField(123),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

            act(() => {
                result.current.mutate(customFieldInputDefinition)
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
                expect(result.current.error).toBeDefined()
                expect(invalidateQueriesSpy).toHaveBeenCalledTimes(0)
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message: 'foo error',
                            status: NotificationStatus.Error,
                        },
                    },
                ])
            })

            invalidateQueriesSpy.mockRestore()
        })
    })

    describe('useUpdateCustomFields', () => {
        it('successful query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )
            const activeParams: ListParams = {
                archived: false,
                object_type: 'Ticket',
            }
            mockedServer
                .onPut('/api/custom-fields/')
                .reply(200, {data: [ticketInputFieldDefinition]})
            const {result, waitFor} = renderHook(
                () => useUpdateCustomFields(activeParams),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

            act(() => {
                result.current.mutate([
                    {
                        id: ticketInputFieldDefinition.id,
                        priority: 999,
                    },
                ])
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
                expect(result.current.data).toMatchSnapshot()
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: customFieldDefinitionKeys.list(activeParams),
                })
            })

            invalidateQueriesSpy.mockRestore()
        })

        it('failure query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )
            mockedServer.onPut('/api/custom-fields/').reply(400, {
                error: {msg: 'foo error'},
            })
            const {result, waitFor} = renderHook(
                () =>
                    useUpdateCustomFields({
                        archived: false,
                        object_type: 'Ticket',
                    }),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

            act(() => {
                result.current.mutate([
                    {
                        id: ticketInputFieldDefinition.id,
                        priority: 999,
                    },
                ])
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
                expect(result.current.error).toBeDefined()
                expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1)
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message: 'foo error',
                            status: NotificationStatus.Error,
                        },
                    },
                ])
            })

            invalidateQueriesSpy.mockRestore()
        })
    })

    describe('useUpdateCustomFieldStatus', () => {
        it('successful query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )
            mockedServer
                .onPut('/api/custom-fields/123')
                .reply(200, ticketInputFieldDefinition)
            const {result, waitFor} = renderHook(
                () => useUpdateCustomFieldStatus(123),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

            act(() => {
                result.current.mutate({archived: true})
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
                expect(result.current.data).toMatchSnapshot()
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: customFieldDefinitionKeys.all(),
                })
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message: 'Ticket field successfully archived.',
                            status: NotificationStatus.Success,
                        },
                    },
                ])
            })

            invalidateQueriesSpy.mockRestore()
        })

        it('failure query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )
            mockedServer.onPut('/api/custom-fields/123').reply(400, {
                error: {msg: 'foo error'},
            })
            const {result, waitFor} = renderHook(
                () => useUpdateCustomFieldStatus(123),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

            act(() => {
                result.current.mutate({archived: true})
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
                expect(result.current.error).toBeDefined()
                expect(invalidateQueriesSpy).toHaveBeenCalledTimes(0)
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message: 'Failed to archive ticket field.',
                            status: NotificationStatus.Error,
                        },
                    },
                ])
            })

            invalidateQueriesSpy.mockRestore()
        })
    })

    describe('useUpdateCustomFieldValue', () => {
        const ticketId = 123
        const fieldValue = 'foo'

        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onPut(
                    `/api/tickets/${ticketId}/custom-fields/${ticketInputFieldDefinition.id}`
                )
                .reply(200, {
                    field: ticketInputFieldDefinition,
                    value: fieldValue,
                })

            const {result, waitFor} = renderHook(
                () => useUpdateCustomFieldValue(),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

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
            //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(result.current.data?.value).toEqual(fieldValue)
        })
    })

    describe('useDeleteCustomFieldValue', () => {
        const ticketId = 123

        it('should succeed and not return data', async () => {
            const mockStore = configureMockStore([thunk])()

            mockedServer
                .onDelete(
                    `/api/tickets/${ticketId}/custom-fields/${ticketInputFieldDefinition.id}`
                )
                .reply(204)

            const {result, waitFor} = renderHook(
                () => useDeleteCustomFieldValue(),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                }
            )

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
