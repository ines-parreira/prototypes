import {
    InfiniteQueryObserverSuccessResult,
    useInfiniteQuery,
} from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'

import { listVoiceQueues } from '@gorgias/api-client'
import { queryKeys } from '@gorgias/api-queries'

import { assumeMock } from 'utils/testing'

import { useInfiniteListVoiceQueues } from '../useInfiniteListVoiceQueues'

jest.mock('@tanstack/react-query')
const useInfiniteQueryMock = assumeMock(useInfiniteQuery)

jest.mock('@gorgias/api-client')
const listVoiceQueuesMock = assumeMock(listVoiceQueues)

describe('useInfiniteListVoiceQueues', () => {
    it('should call useInfiniteQuery with correct parameters', async () => {
        const returnValue = {
            data: { pages: [], pageParams: [] },
        } as unknown as InfiniteQueryObserverSuccessResult<unknown, unknown>

        useInfiniteQueryMock.mockReturnValue(returnValue)

        const { result } = renderHook(() =>
            useInfiniteListVoiceQueues({ search: 'test' }),
        )

        expect(useInfiniteQueryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [
                    ...queryKeys.voiceQueues.listVoiceQueues({
                        search: 'test',
                    }),
                    'paginated',
                ],
                staleTime: 60_000,
                refetchOnWindowFocus: false,
            }),
        )

        expect(result.current).toEqual(returnValue)

        const useInfiniteQueryParams = useInfiniteQueryMock.mock
            .calls[0][0] as any
        await useInfiniteQueryParams.queryFn({ pageParam: '==cursor==' })
        expect(listVoiceQueuesMock).toHaveBeenCalledWith(
            { search: 'test', cursor: '==cursor==' },
            { signal: undefined },
        )
        expect(
            useInfiniteQueryParams.getNextPageParam({
                data: { meta: { next_cursor: '==cursor==' } },
            }),
        ).toBe('==cursor==')
    })
})
