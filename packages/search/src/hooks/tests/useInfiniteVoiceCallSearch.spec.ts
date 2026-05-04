import { useInfiniteQuery } from '@tanstack/react-query'

import { searchVoiceCalls } from '@gorgias/helpdesk-client'
import {
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

vi.mock('@gorgias/helpdesk-client', () => ({
    searchVoiceCalls: vi.fn(),
}))

describe('useInfiniteVoiceCallSearch', () => {
    it('configures the infinite voice-call query and forwards the query fn', async () => {
        const response = mockSearchVoiceCallsResponse({
            data: [{ entity: mockVoiceCall({ id: 303 }) } as never],
        })

        vi.mocked(searchVoiceCalls).mockResolvedValue({
            data: response,
        } as never)

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
        ).resolves.toEqual({ data: response })
        expect(
            queryConfig?.getNextPageParam?.({
                data: { meta: { next_cursor: 'next' } },
            }),
        ).toBe('next')
        expect(searchVoiceCalls).toHaveBeenCalledWith(
            { search: 'refund' },
            { limit: 25, cursor: 'cursor-2', with_highlights: true },
            { signal: undefined },
        )
    })
})
