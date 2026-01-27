import { describe, expect, it } from 'vitest'

import type { UserAvailability } from '@gorgias/helpdesk-queries'

import { AVAILABLE_STATUS } from '../../constants'
import type { AgentStatusWithSystem } from '../../types'
import { resolveActiveStatus } from '../resolveActiveStatus'

const CUSTOM_STATUS: AgentStatusWithSystem = {
    id: '123',
    name: 'Custom',
    duration_unit: 'hours',
    duration_value: 1,
    is_system: false,
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
}

describe('resolveActiveStatus', () => {
    const mockStatuses: AgentStatusWithSystem[] = [
        { ...AVAILABLE_STATUS, is_system: true },
        CUSTOM_STATUS,
    ]

    it.each([
        {
            description: 'system status',
            status: {
                user_id: 1,
                user_status: 'available',
                updated_datetime: '2024-01-01T00:00:00Z',
            } as UserAvailability,
            expectedId: 'available',
        },
        {
            description: 'custom status',
            status: {
                user_id: 1,
                user_status: 'custom',
                custom_user_availability_status_id: CUSTOM_STATUS.id,
                updated_datetime: '2024-01-01T00:00:00Z',
            } as UserAvailability,
            expectedId: CUSTOM_STATUS.id,
        },
    ])(
        'should return $description when user has $description',
        ({ status, expectedId }) => {
            const result = resolveActiveStatus(status, mockStatuses)

            expect(result?.id).toBe(expectedId)
        },
    )

    it.each([
        {
            description: 'status is undefined',
            status: undefined,
            statuses: mockStatuses,
        },
        {
            description: 'statuses is undefined',
            status: {
                user_id: 1,
                user_status: 'available',
                updated_datetime: '2024-01-01T00:00:00Z',
            } as UserAvailability,
            statuses: undefined,
        },
        {
            description: 'status not found',
            status: {
                user_id: 1,
                user_status: 'custom',
                custom_user_availability_status_id: '999',
                updated_datetime: '2024-01-01T00:00:00Z',
            } as UserAvailability,
            statuses: mockStatuses,
        },
    ])('should return undefined when $description', ({ status, statuses }) => {
        const result = resolveActiveStatus(status, statuses)

        expect(result).toBeUndefined()
    })
})
