import {ListTeamsOrderBy, queryKeys} from '@gorgias/api-queries'
import {QueryClientProvider} from '@tanstack/react-query'
import * as reactQuery from '@tanstack/react-query'
import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'

import {
    axiosSuccessResponse,
    apiListCursorPaginationResponse,
} from 'fixtures/axiosResponse'
import {teams} from 'fixtures/teams'
import {handleError} from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchTeams} from 'models/team/resources'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import useListTeams from '../useListTeams'

const queryClient = mockQueryClient()

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)
const dispatchMock = jest.fn()
useAppDispatchMock.mockReturnValue(dispatchMock)

jest.mock('hooks/agents/errorHandler')
const handleErrorMock = assumeMock(handleError)

jest.mock('models/team/resources')
const mockFetchTeams = assumeMock(fetchTeams)

const useInfiniteQuerySpy = jest.spyOn(reactQuery, 'useInfiniteQuery')

describe('useListTeams', () => {
    it('should call useListTeams with proper params and return the response', async () => {
        const orderBy = ListTeamsOrderBy.CreatedDatetimeAsc
        const query = {
            staleTime: 10000,
            enabled: true,
        }
        mockFetchTeams.mockResolvedValueOnce(
            axiosSuccessResponse(apiListCursorPaginationResponse(teams))
        )
        const {result} = renderHook(() => useListTeams({orderBy}, query), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(useInfiniteQuerySpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: queryKeys.teams.listTeams(),
                queryFn: expect.any(Function),
                getNextPageParam: expect.any(Function),
                ...query,
            })
        )
        expect(mockFetchTeams).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy,
            })
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.data?.pages[0]).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    data: teams,
                }),
            })
        )
    })

    it('should call handleError when useListTeams returns an error', async () => {
        const errorMsgMock = 'errorMsgMock'
        mockFetchTeams.mockRejectedValueOnce({
            response: errorMsgMock,
        })
        const {result} = renderHook(() => useListTeams(), {
            wrapper: ({children}) => (
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
            dispatchMock
        )
        expect(result.current.isLoading).toBe(false)
    })
})
