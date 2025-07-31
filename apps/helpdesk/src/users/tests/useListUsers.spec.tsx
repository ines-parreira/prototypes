import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import * as reactQuery from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { ListUsersRolesItem, queryKeys } from '@gorgias/helpdesk-queries'

import { agents } from 'fixtures/agents'
import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { handleError } from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'
import { fetchAgents } from 'models/agents/resources'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import useListUsers from '../useListUsers'

const queryClient = mockQueryClient()

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)
const dispatchMock = jest.fn()
useAppDispatchMock.mockReturnValue(dispatchMock)

jest.mock('hooks/agents/errorHandler')
const handleErrorMock = assumeMock(handleError)

jest.mock('models/agents/resources')
const mockFetchAgents = assumeMock(fetchAgents)

const useInfiniteQuerySpy = jest.spyOn(reactQuery, 'useInfiniteQuery')

describe('useListUsers', () => {
    it('should call useListUsers with proper params and return the response', async () => {
        const roles = [ListUsersRolesItem.BasicAgent]
        const query = {
            staleTime: 10000,
            enabled: true,
        }
        mockFetchAgents.mockResolvedValueOnce(
            axiosSuccessResponse(apiListCursorPaginationResponse(agents)),
        )
        const { result } = renderHook(() => useListUsers({ roles }, query), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(useInfiniteQuerySpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: queryKeys.users.listUsers(),
                queryFn: expect.any(Function),
                getNextPageParam: expect.any(Function),
                ...query,
            }),
        )
        expect(mockFetchAgents).toHaveBeenCalledWith(
            expect.objectContaining({
                roles,
            }),
        )
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.data?.pages[0]).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    data: agents,
                }),
            }),
        )
    })

    it('should call handleError when useListUsers returns an error', async () => {
        const errorMsgMock = 'errorMsgMock'
        mockFetchAgents.mockRejectedValueOnce({
            response: errorMsgMock,
        })
        const { result } = renderHook(() => useListUsers(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(handleErrorMock).toHaveBeenCalledWith(
            expect.objectContaining({
                response: errorMsgMock,
            }),
            expect.any(String),
            dispatchMock,
        )
        expect(result.current.isLoading).toBe(false)
    })
})
