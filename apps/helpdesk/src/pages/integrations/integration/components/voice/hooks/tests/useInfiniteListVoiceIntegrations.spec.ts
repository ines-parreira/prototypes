import { assumeMock, renderHook } from '@repo/testing'
import type { InfiniteQueryObserverSuccessResult } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListIntegrationsHandler,
    mockListIntegrationsResponse,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import {
    IntegrationType,
    ListIntegrationsOrderBy,
} from '@gorgias/helpdesk-types'

import { useInfiniteListVoiceIntegrations } from '../useInfiniteListVoiceIntegrations'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useInfiniteQuery: jest.fn(),
}))
const useInfiniteQueryMock = assumeMock(useInfiniteQuery)

const listIntegrationsHandler = mockListIntegrationsHandler(async () =>
    HttpResponse.json(mockListIntegrationsResponse()),
)
const server = setupServer(listIntegrationsHandler.handler)

describe('useInfiniteListVoiceIntegrations', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should call useInfiniteQuery with correct parameters', async () => {
        const waitForListIntegrationsRequest =
            listIntegrationsHandler.waitForRequest(server)
        const returnValue = {
            data: { pages: [], pageParams: [] },
        } as unknown as InfiniteQueryObserverSuccessResult<unknown, unknown>

        useInfiniteQueryMock.mockReturnValue(returnValue)

        const { result } = renderHook(() =>
            useInfiniteListVoiceIntegrations({ limit: 50 }),
        )

        expect(useInfiniteQueryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [
                    ...queryKeys.integrations.listIntegrations({
                        limit: 50,
                    }),
                    'paginated',
                ],
            }),
        )

        expect(result.current).toEqual(returnValue)

        const useInfiniteQueryParams = useInfiniteQueryMock.mock
            .calls[0][0] as any
        await useInfiniteQueryParams.queryFn({ pageParam: '==cursor==' })
        await waitForListIntegrationsRequest(async (request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('limit')).toBe('50')
            expect(searchParams.get('order_by')).toBe(
                ListIntegrationsOrderBy.CreatedDatetimeDesc,
            )
            expect(searchParams.get('cursor')).toBe('==cursor==')
            expect(searchParams.get('type')).toBe(IntegrationType.Phone)
        })
        expect(
            useInfiniteQueryParams.getNextPageParam({
                data: { meta: { next_cursor: '==cursor==' } },
            }),
        ).toBe('==cursor==')
    })
})
