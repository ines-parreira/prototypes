import { assumeMock, renderHook } from '@repo/testing'
import type { InfiniteQueryObserverSuccessResult } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'

import {
    IntegrationType,
    listIntegrations,
    ListIntegrationsOrderBy,
} from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useInfiniteListVoiceIntegrations } from '../useInfiniteListVoiceIntegrations'

jest.mock('@tanstack/react-query')
const useInfiniteQueryMock = assumeMock(useInfiniteQuery)

jest.mock('@gorgias/helpdesk-client')
const listIntegrationsMock = assumeMock(listIntegrations)

describe('useInfiniteListVoiceIntegrations', () => {
    it('should call useInfiniteQuery with correct parameters', async () => {
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
        expect(listIntegrationsMock).toHaveBeenCalledWith(
            {
                limit: 50,
                order_by: ListIntegrationsOrderBy.CreatedDatetimeDesc,
                cursor: '==cursor==',
                type: IntegrationType.Phone,
            },
            { signal: undefined },
        )
        expect(
            useInfiniteQueryParams.getNextPageParam({
                data: { meta: { next_cursor: '==cursor==' } },
            }),
        ).toBe('==cursor==')
    })
})
