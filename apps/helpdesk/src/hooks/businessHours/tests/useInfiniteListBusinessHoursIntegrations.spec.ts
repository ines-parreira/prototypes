import { assumeMock, renderHook } from '@repo/testing'
import type { InfiniteQueryObserverSuccessResult } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'

import { listBusinessHoursIntegrations } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useInfiniteListBusinessHoursIntegrations } from '../useInfiniteListBusinessHoursIntegrations'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useInfiniteQuery: jest.fn(),
}))
const useInfiniteQueryMock = assumeMock(useInfiniteQuery)

jest.mock('@gorgias/helpdesk-client')
const listBusinessHoursIntegrationsMock = assumeMock(
    listBusinessHoursIntegrations,
)

describe('useInfiniteListBusinessHoursIntegrations', () => {
    it('should call useInfiniteQuery with correct parameters', async () => {
        const returnValue = {
            data: { pages: [], pageParams: [] },
        } as unknown as InfiniteQueryObserverSuccessResult<unknown, unknown>

        useInfiniteQueryMock.mockReturnValue(returnValue)

        const { result } = renderHook(() =>
            useInfiniteListBusinessHoursIntegrations(1),
        )

        expect(useInfiniteQueryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [
                    ...queryKeys.businessHours.listBusinessHoursIntegrations(1),
                    'paginated',
                ],
            }),
        )

        expect(result.current).toEqual(returnValue)

        const useInfiniteQueryParams = useInfiniteQueryMock.mock
            .calls[0][0] as any
        await useInfiniteQueryParams.queryFn({ pageParam: '==cursor==' })
        expect(listBusinessHoursIntegrationsMock).toHaveBeenCalledWith(
            1,
            { cursor: '==cursor==' },
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
            useInfiniteListBusinessHoursIntegrations(1, undefined, options),
        )

        expect(useInfiniteQueryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [
                    ...queryKeys.businessHours.listBusinessHoursIntegrations(1),
                    'paginated',
                ],
                staleTime: 30000,
                refetchOnWindowFocus: true,
            }),
        )
    })
})
