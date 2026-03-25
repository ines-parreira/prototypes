import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../tests/render.utils'
import * as hooks from '../useAgentStatuses'
import { useCustomUserUnavailabilityStatus } from '../useCustomUserUnavailabilityStatus'

vi.mock('../useAgentStatuses', async () => {
    const actual = await vi.importActual<typeof hooks>('../useAgentStatuses')
    return {
        ...actual,
        useAgentStatuses: vi.fn(),
    }
})

describe('useCustomUserUnavailabilityStatus', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns undefined when statusId is undefined', () => {
        vi.mocked(hooks.useAgentStatuses).mockReturnValue({
            data: [],
        } as any)

        const { result } = renderHook(() =>
            useCustomUserUnavailabilityStatus(undefined),
        )

        expect(result.current).toBeUndefined()
    })

    it('returns undefined when statuses not loaded', () => {
        vi.mocked(hooks.useAgentStatuses).mockReturnValue({
            data: undefined,
        } as any)

        const { result } = renderHook(() =>
            useCustomUserUnavailabilityStatus('status-1'),
        )

        expect(result.current).toBeUndefined()
    })

    it('returns status when found', () => {
        vi.mocked(hooks.useAgentStatuses).mockReturnValue({
            data: [
                {
                    id: 'status-1',
                    name: 'Lunch break',
                    created_datetime: '2024-01-01T00:00:00Z',
                    is_system: false,
                },
                {
                    id: 'status-2',
                    name: 'In a meeting',
                    created_datetime: '2024-01-01T00:00:00Z',
                    is_system: false,
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useCustomUserUnavailabilityStatus('status-1'),
        )

        expect(result.current).toEqual({
            id: 'status-1',
            name: 'Lunch break',
            created_datetime: '2024-01-01T00:00:00Z',
            is_system: false,
        })
    })

    it('returns undefined when status not found', () => {
        vi.mocked(hooks.useAgentStatuses).mockReturnValue({
            data: [
                {
                    id: 'status-1',
                    name: 'Lunch break',
                    created_datetime: '2024-01-01T00:00:00Z',
                    is_system: false,
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useCustomUserUnavailabilityStatus('status-999'),
        )

        expect(result.current).toBeUndefined()
    })
})
