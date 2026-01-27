import { describe, expect, it } from 'vitest'

import type { UserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import { buildUpdateData } from '../buildUpdateData'

describe('buildUpdateData', () => {
    it.each<{
        statusId: UserAvailabilityStatus | string
        expected: unknown
    }>([
        {
            statusId: 'available',
            expected: { user_status: 'available' },
        },
        {
            statusId: 'unavailable',
            expected: { user_status: 'unavailable' },
        },
    ])(
        'should return $expected when statusId is $statusId',
        ({ statusId, expected }) => {
            const result = buildUpdateData(statusId)

            expect(result).toEqual(expected)
        },
    )

    it('should return custom status data when custom statusId is provided', () => {
        const result = buildUpdateData('custom-123')

        expect(result).toEqual({
            user_status: 'custom',
            custom_user_availability_status_id: 'custom-123',
        })
    })
})
