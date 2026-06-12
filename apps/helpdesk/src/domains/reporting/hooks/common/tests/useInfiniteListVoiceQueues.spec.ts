import { assumeMock, renderHook } from '@repo/testing'
import type { InfiniteQueryObserverSuccessResult } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListVoiceQueuesHandler,
    mockListVoiceQueuesResponse,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useInfiniteListVoiceQueues } from 'domains/reporting/hooks/common/useInfiniteListVoiceQueues'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useInfiniteQuery: jest.fn(),
}))
const useInfiniteQueryMock = assumeMock(useInfiniteQuery)
const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('useInfiniteListVoiceQueues', () => {
    it('should call useInfiniteQuery with correct parameters', async () => {
        const returnValue = {
            data: { pages: [], pageParams: [] },
        } as unknown as InfiniteQueryObserverSuccessResult<unknown, unknown>
        const listVoiceQueuesMock = mockListVoiceQueuesHandler(async () =>
            HttpResponse.json(
                mockListVoiceQueuesResponse({
                    data: [],
                    meta: {
                        next_cursor: '==cursor==',
                        prev_cursor: null,
                        total_resources: 0,
                    },
                }),
            ),
        )
        const waitForListVoiceQueuesRequest =
            listVoiceQueuesMock.waitForRequest(server)
        server.use(listVoiceQueuesMock.handler)

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
            }),
        )

        expect(result.current).toEqual(returnValue)

        const useInfiniteQueryParams = useInfiniteQueryMock.mock
            .calls[0][0] as any
        await useInfiniteQueryParams.queryFn({ pageParam: '==cursor==' })
        await waitForListVoiceQueuesRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('search')).toBe('test')
            expect(searchParams.get('cursor')).toBe('==cursor==')
        })
        expect(
            useInfiniteQueryParams.getNextPageParam({
                data: { meta: { next_cursor: '==cursor==' } },
            }),
        ).toBe('==cursor==')
    })
})
