import { assumeMock, renderHook } from '@repo/testing'
import {
    InfiniteQueryObserverSuccessResult,
    useInfiniteQuery,
} from '@tanstack/react-query'

import { listBusinessHours } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useInfiniteListBusinessHours } from '../useInfiniteListBusinessHours'

jest.mock('@tanstack/react-query')
const useInfiniteQueryMock = assumeMock(useInfiniteQuery)

jest.mock('@gorgias/helpdesk-client')
const listBusinessHoursMock = assumeMock(listBusinessHours)

describe('useInfiniteListBusinessHours', () => {
    it('should call useInfiniteQuery with correct parameters', async () => {
        const returnValue = {
            data: { pages: [], pageParams: [] },
        } as unknown as InfiniteQueryObserverSuccessResult<unknown, unknown>

        useInfiniteQueryMock.mockReturnValue(returnValue)

        const { result } = renderHook(() =>
            useInfiniteListBusinessHours({ name: 'test' }),
        )

        expect(useInfiniteQueryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [
                    ...queryKeys.businessHours.listBusinessHours({
                        name: 'test',
                    }),
                    'paginated',
                ],
            }),
        )

        expect(result.current).toEqual(returnValue)

        const useInfiniteQueryParams = useInfiniteQueryMock.mock
            .calls[0][0] as any
        await useInfiniteQueryParams.queryFn({ pageParam: '==cursor==' })
        expect(listBusinessHoursMock).toHaveBeenCalledWith(
            { name: 'test', cursor: '==cursor==' },
            { signal: undefined },
        )
        expect(
            useInfiniteQueryParams.getNextPageParam({
                data: { meta: { next_cursor: '==cursor==' } },
            }),
        ).toBe('==cursor==')
    })

    it('should pass through additional options', () => {
        const returnValue = {
            data: { pages: [], pageParams: [] },
        } as unknown as InfiniteQueryObserverSuccessResult<unknown, unknown>

        useInfiniteQueryMock.mockReturnValue(returnValue)

        const options = {
            staleTime: 30000,
            refetchOnWindowFocus: true,
        }

        renderHook(() =>
            useInfiniteListBusinessHours({ name: 'test' }, options),
        )

        expect(useInfiniteQueryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [
                    ...queryKeys.businessHours.listBusinessHours({
                        name: 'test',
                    }),
                    'paginated',
                ],
                staleTime: 30000,
                refetchOnWindowFocus: true,
            }),
        )
    })
})
