import { assumeMock, renderHook } from '@repo/testing'
import type { InfiniteQueryObserverSuccessResult } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'
import { setupServer } from 'msw/node'

import { mockListBusinessHoursIntegrationsHandler } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useInfiniteListBusinessHoursIntegrations } from '../useInfiniteListBusinessHoursIntegrations'

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

describe('useInfiniteListBusinessHoursIntegrations', () => {
    it('should call useInfiniteQuery with correct parameters', async () => {
        const listBusinessHoursIntegrationsMock =
            mockListBusinessHoursIntegrationsHandler()
        const waitForListBusinessHoursIntegrationsRequest =
            listBusinessHoursIntegrationsMock.waitForRequest(server)
        server.use(listBusinessHoursIntegrationsMock.handler)
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
        await waitForListBusinessHoursIntegrationsRequest((request) => {
            const url = new URL(request.url)

            expect(url.pathname).toContain('/business-hours/1/integrations')
            expect(url.searchParams.get('cursor')).toBe('==cursor==')
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
