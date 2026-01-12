import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    queryKeys,
    useCreateCustomUserAvailabilityStatus,
} from '@gorgias/helpdesk-queries'

import {
    createTestQueryClient,
    getMutationConfig,
    renderHook,
} from '../../tests/render.utils'
import { useCreateAgentStatus } from '../useCreateAgentStatus'

type CreateStatusConfig = NonNullable<
    Parameters<typeof useCreateCustomUserAvailabilityStatus>[0]
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
        useCreateCustomUserAvailabilityStatus: vi.fn(),
    }
})

describe('useCreateAgentStatus', () => {
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
        renderHook(() => useCreateAgentStatus(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        const config = getMutationConfig<CreateStatusConfig>(
            vi.mocked(useCreateCustomUserAvailabilityStatus),
        )

        const mockData = {
            data: {
                id: 'status-1',
                name: 'Lunch break',
                duration_unit: 'minutes' as const,
                duration_value: 30,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
            },
        }

        config?.mutation?.onSuccess?.(mockData as any, {} as any, undefined)

        expect(spies.invalidateQueries).toHaveBeenCalledWith({
            queryKey: listKey,
        })
    })

    it('should define onSuccess callback in config', () => {
        const { queryClient } = createTestQueryClient()

        vi.mocked(useQueryClient).mockReturnValue(queryClient)
        renderHook(() => useCreateAgentStatus(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        const config = getMutationConfig<CreateStatusConfig>(
            vi.mocked(useCreateCustomUserAvailabilityStatus),
        )

        expect(config?.mutation?.onSuccess).toBeDefined()
    })
})
