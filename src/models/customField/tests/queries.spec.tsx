import MockAdapter from 'axios-mock-adapter'
import {renderHook} from 'react-hooks-testing-library'
import {act, waitFor} from '@testing-library/react'
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
    useGetCustomFieldDefinition,
    useGetCustomFieldDefinitions,
    useUpdateCustomField,
    useUpdateCustomFieldStatus,
} from 'models/customField/queries'
import {customField, customFieldInput} from 'fixtures/customField'
import {NotificationStatus} from 'state/notifications/types'

const mockedServer = new MockAdapter(client)
const queryClient = createTestQueryClient()

describe('queries.spec.tsx', () => {
    beforeEach(async () => {
        mockedServer.reset()
        await queryClient.invalidateQueries()
    })

    describe('useGetCustomFieldDefinitions', () => {
        it('successful query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/custom-fields/')
                .reply(200, {data: [customField]})
            const {result} = renderHook(
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

        it('failure query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/custom-fields')
                .reply(404, {message: 'error'})
            const {result} = renderHook(
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
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message:
                                'Failed to fetch ticket custom fields list',
                            status: NotificationStatus.Error,
                        },
                    },
                ])
            })
        })
    })

    describe('useGetCustomFieldDefinition', () => {
        it('successful query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer.onGet('/api/custom-fields/123').reply(200, customField)
            const {result} = renderHook(
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

        it('failure query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/custom-fields/123')
                .reply(404, {message: 'error'})

            const {result} = renderHook(
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
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message: 'Failed to fetch custom field',
                            status: NotificationStatus.Error,
                        },
                    },
                ])
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
            mockedServer.onPost('/api/custom-fields').reply(200, customField)
            const {result} = renderHook(() => useCreateCustomField(), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            act(() => {
                result.current.mutate(customFieldInput)
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
                expect(result.current.data).toMatchSnapshot()
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: customFieldDefinitionKeys.all,
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
            const {result} = renderHook(() => useCreateCustomField(), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            act(() => {
                result.current.mutate(customFieldInput)
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
            mockedServer.onPut('/api/custom-fields/123').reply(200, customField)
            const {result} = renderHook(() => useUpdateCustomField(123), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            act(() => {
                result.current.mutate(customFieldInput)
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
                expect(result.current.data).toMatchSnapshot()
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: customFieldDefinitionKeys.all,
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
            const {result} = renderHook(() => useUpdateCustomField(123), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            act(() => {
                result.current.mutate(customFieldInput)
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

    describe('useUpdateCustomFieldStatus', () => {
        it('successful query hook', async () => {
            const mockStore = configureMockStore([thunk])()
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )
            mockedServer.onPut('/api/custom-fields/123').reply(200, customField)
            const {result} = renderHook(() => useUpdateCustomFieldStatus(123), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            act(() => {
                result.current.mutate({archived: true})
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
                expect(result.current.data).toMatchSnapshot()
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: customFieldDefinitionKeys.all,
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
            const {result} = renderHook(() => useUpdateCustomFieldStatus(123), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

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
})
