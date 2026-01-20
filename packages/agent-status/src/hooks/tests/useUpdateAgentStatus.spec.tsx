import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    queryKeys,
    useUpdateCustomUserAvailabilityStatus,
} from '@gorgias/helpdesk-queries'
import type {
    CustomUserAvailabilityStatus,
    HttpResponse,
} from '@gorgias/helpdesk-queries'

import {
    createTestQueryClient,
    getMutationConfig,
    renderHook,
} from '../../tests/render.utils'
import { useUpdateAgentStatus } from '../useUpdateAgentStatus'

type UpdateStatusConfig = NonNullable<
    Parameters<typeof useUpdateCustomUserAvailabilityStatus>[0]
>

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query')
    return {
        ...actual,
        useQueryClient: vi.fn(),
    }
})

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual('@gorgias/helpdesk-queries')
    return {
        ...actual,
        useUpdateCustomUserAvailabilityStatus: vi.fn(),
    }
})

describe('useUpdateAgentStatus', () => {
    const listKey =
        queryKeys.customUserAvailabilityStatus.listCustomUserAvailabilityStatuses()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should invalidate queries on success', () => {
        const { queryClient, spies } = createTestQueryClient({
            withInvalidateQueriesSpy: true,
        })

        vi.mocked(useQueryClient).mockReturnValue(queryClient)
        renderHook(() => useUpdateAgentStatus(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        const config = getMutationConfig<UpdateStatusConfig>(
            vi.mocked(useUpdateCustomUserAvailabilityStatus),
        )

        const mockData = {
            data: {
                id: 'status-1',
                name: 'Updated lunch break',
                duration_unit: 'hours' as const,
                duration_value: 1,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-02T00:00:00Z',
            },
        } as HttpResponse<CustomUserAvailabilityStatus>

        config?.mutation?.onSuccess?.(
            mockData,
            { pk: 'status-1', data: mockData.data },
            undefined,
        )

        expect(spies.invalidateQueries).toHaveBeenCalledWith({
            queryKey: listKey,
        })
    })
})
