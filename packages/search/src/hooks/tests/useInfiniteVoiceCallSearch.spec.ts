import { useInfiniteQuery } from '@tanstack/react-query'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockSearchVoiceCallsHandler,
    mockSearchVoiceCallsResponse,
    mockVoiceCall,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useInfiniteVoiceCallSearch } from '../useInfiniteVoiceCallSearch'

vi.mock('@tanstack/react-query', () => ({
    useInfiniteQuery: vi.fn((options) => ({
        ...options,
        data: {
            pages: [],
        },
    })),
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useInfiniteVoiceCallSearch', () => {
    it('configures the infinite voice-call query and forwards the query fn', async () => {
        const response = mockSearchVoiceCallsResponse({
            data: [{ entity: mockVoiceCall({ id: 303 }) } as never],
        })
        const searchVoiceCallsMock = mockSearchVoiceCallsHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForSearchVoiceCallsRequest =
            searchVoiceCallsMock.waitForRequest(server)
        server.use(searchVoiceCallsMock.handler)

        useInfiniteVoiceCallSearch({
            query: 'refund',
            enabled: true,
            limit: 25,
        })

        const queryConfig = vi.mocked(useInfiniteQuery).mock.calls[0]?.[0] as
            | {
                  queryFn?: (context: {
                      pageParam?: string
                  }) => Promise<unknown>
                  getNextPageParam?: (page: Record<string, any>) => unknown
              }
            | undefined

        expect(vi.mocked(useInfiniteQuery)).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [
                    ...queryKeys.search.all(),
                    'voice-calls',
                    {
                        query: 'refund',
                        limit: 25,
                    },
                ],
                enabled: true,
                queryFn: expect.any(Function),
                getNextPageParam: expect.any(Function),
            }),
        )
        await expect(
            queryConfig?.queryFn?.({ pageParam: 'cursor-2' }),
        ).resolves.toEqual(expect.objectContaining({ data: response }))
        await waitForSearchVoiceCallsRequest(async (request) => {
            const body = (await request.json()) as { search?: string }
            const searchParams = new URL(request.url).searchParams

            expect(body.search).toBe('refund')
            expect(searchParams.get('limit')).toBe('25')
            expect(searchParams.get('cursor')).toBe('cursor-2')
            expect(searchParams.get('with_highlights')).toBe('true')
        })
        expect(
            queryConfig?.getNextPageParam?.({
                data: { meta: { next_cursor: 'next' } },
            }),
        ).toBe('next')
    })
})
