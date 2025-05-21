import { QueryClientProvider } from '@tanstack/react-query'
import * as reactQuery from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { queryKeys } from '@gorgias/api-queries'

import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { tags } from 'fixtures/tag'
import { handleError } from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'
import { fetchTags } from 'models/tag/resources'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import useListTags from '../useListTags'

const queryClient = mockQueryClient()

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)
const dispatchMock = jest.fn()
useAppDispatchMock.mockReturnValue(dispatchMock)

jest.mock('hooks/agents/errorHandler')
const handleErrorMock = assumeMock(handleError)

jest.mock('models/tag/resources')
const mockFetchTags = assumeMock(fetchTags)

const useInfiniteQuerySpy = jest.spyOn(reactQuery, 'useInfiniteQuery')

describe('useListTags', () => {
    it('should call useListTags with proper params and return the response', async () => {
        const params = { search: 'refund' }
        const query = {
            staleTime: 10000,
            enabled: true,
        }
        mockFetchTags.mockResolvedValueOnce(
            axiosSuccessResponse(apiListCursorPaginationResponse(tags)),
        )
        const { result } = renderHook(() => useListTags(params, query), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(useInfiniteQuerySpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: queryKeys.tags.listTags({
                    search: params.search,
                }),
                queryFn: expect.any(Function),
                getNextPageParam: expect.any(Function),
                ...query,
            }),
        )
        expect(mockFetchTags).toHaveBeenCalledWith(
            expect.objectContaining(params),
        )
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.data?.pages[0]).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    data: tags,
                }),
            }),
        )
    })

    it('should call handleError when useListTags returns an error', async () => {
        const errorMsgMock = 'errorMsgMock'
        mockFetchTags.mockRejectedValueOnce({
            response: errorMsgMock,
        })
        const { result } = renderHook(() => useListTags(), {
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
