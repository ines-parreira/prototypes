import { assumeMock, renderHook } from '@repo/testing'
import type { InfiniteQueryObserverSuccessResult } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'
import { setupServer } from 'msw/node'

import { mockListBusinessHoursHandler } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useInfiniteListBusinessHours } from '../useInfiniteListBusinessHours'

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

describe('useInfiniteListBusinessHours', () => {
    it('should call useInfiniteQuery with correct parameters', async () => {
        const listBusinessHoursMock = mockListBusinessHoursHandler()
        const waitForListBusinessHoursRequest =
            listBusinessHoursMock.waitForRequest(server)
        server.use(listBusinessHoursMock.handler)
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
        await waitForListBusinessHoursRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('name')).toBe('test')
            expect(searchParams.get('cursor')).toBe('==cursor==')
        })
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
