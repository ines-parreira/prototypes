import React, { ReactNode } from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { SearchType } from '@gorgias/helpdesk-queries'

import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import { handleError } from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'
import client from 'models/api/resources'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import useSearch from '../useSearch'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)
const dispatchMock = jest.fn()
useAppDispatchMock.mockReturnValue(dispatchMock)

jest.mock('hooks/agents/errorHandler')
const handleErrorMock = assumeMock(handleError)

const mockedServer = new MockAdapter(client)
const queryClient = mockQueryClient()

const wrapper = ({ children }: { children?: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const mockData = [{ id: 88, name: 'Homer Simpson' }]

describe('useSearch', () => {
    const body = { query: 'Homer', type: SearchType.Agent }

    it('should be successful and return proper data', async () => {
        const response = apiListCursorPaginationResponse(mockData)
        mockedServer.onPost('/api/search/').reply(200, response)

        const { result } = renderHook(() => useSearch(body), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.data.data).toEqual(mockData)
    })

    // TODO(React18): Fix this flaky test
    it.skip('should call handleError when it returns an error', async () => {
        mockedServer.onPost('/api/search/').reply(400)
        const { result } = renderHook(() => useSearch(body), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(handleErrorMock).toHaveBeenCalledWith(
            new Error('Request failed with status code 400'),
            expect.stringContaining('Failed to fetch agents'),
            dispatchMock,
        )
    })
})
