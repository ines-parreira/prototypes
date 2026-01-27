import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockUserAvailability } from '@gorgias/helpdesk-mocks'
import * as helpdeskQueries from '@gorgias/helpdesk-queries'

import { AVAILABLE_STATUS } from '../../constants'
import { renderHook } from '../../tests/render.utils'
import type { AgentStatusWithSystem } from '../../types'
import * as resolveActiveStatusModule from '../../utils/resolveActiveStatus'
import { useUserAvailabilityStatus } from '../useUserAvailabilityStatus'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueries>(
        '@gorgias/helpdesk-queries',
    )
    return {
        ...actual,
        useGetUserAvailability: vi.fn(),
        useListCustomUserAvailabilityStatuses: vi.fn(),
    }
})

vi.mock('../../utils/resolveActiveStatus')

describe('useUserAvailabilityStatus', () => {
    const userId = 123

    const mockAvailableStatus = mockUserAvailability({
        user_id: userId,
        user_status: 'available',
    })

    const CUSTOM_STATUS: AgentStatusWithSystem = {
        id: '456',
        name: 'Custom',
        is_system: false,
        duration_unit: 'hours',
        duration_value: 1,
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
    }

    const mockStatuses = [
        { ...AVAILABLE_STATUS, is_system: true },
        CUSTOM_STATUS,
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
            data: { data: mockAvailableStatus },
        } as any)
        vi.mocked(
            helpdeskQueries.useListCustomUserAvailabilityStatuses,
        ).mockReturnValue({
            data: { data: { data: mockStatuses } },
            isLoading: false,
            isError: false,
        } as any)
        vi.mocked(
            resolveActiveStatusModule.resolveActiveStatus,
        ).mockReturnValue({ ...AVAILABLE_STATUS, is_system: true })
    })

    it('should return status correctly', () => {
        const { result } = renderHook(() =>
            useUserAvailabilityStatus({ userId }),
        )

        expect(result.current.status).toEqual({
            ...AVAILABLE_STATUS,
            is_system: true,
        })
    })
})
