import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import client from 'models/api/resources'
import {
    useGetHTTPEvent,
    useGetHTTPEvents,
} from 'models/integration/queries/http'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

const mockedServer = new MockAdapter(client)
const queryClient = mockQueryClient()

describe('queries.spec.tsx', () => {
    beforeEach(() => {
        mockedServer.reset()
        queryClient.clear()
    })

    describe('useGetHTTPEvents', () => {
        const response = apiListCursorPaginationResponse([{ id: 1 }, { id: 2 }])

        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/integrations/1/events/')
                .reply(200, response)
            const { result } = renderHook(() => useGetHTTPEvents(1), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data?.data).toStrictEqual(response)
        })

        it('should fail and return proper error', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/custom-fields')
                .reply(404, { message: 'error' })
            const { result } = renderHook(() => useGetHTTPEvents(1), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
                expect(result.current.error).toBeDefined()
            })
        })
    })

    describe('useGetHTTPEvent', () => {
        const response = { id: 1 }

        it('should succeed and return proper data', async () => {
            const mockStore = configureMockStore([thunk])()
            mockedServer
                .onGet('/api/integrations/1/events/1')
                .reply(200, response)
            const { result } = renderHook(
                () => useGetHTTPEvent({ integrationId: 1, eventId: 1 }),
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
                .onGet('/api/integrations/1/events/1')
                .reply(404, { message: 'error' })

            const { result } = renderHook(
                () => useGetHTTPEvent({ integrationId: 1, eventId: 1 }),
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
})
