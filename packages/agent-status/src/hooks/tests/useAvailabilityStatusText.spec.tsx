import { describe, expect, it } from 'vitest'

import type { UserAvailability } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../tests/render.utils'
import { useAvailabilityStatusText } from '../useAvailabilityStatusText'

describe('useAvailabilityStatusText', () => {
    it('returns undefined when userAvailability is undefined', () => {
        const { result } = renderHook(() =>
            useAvailabilityStatusText(undefined, undefined),
        )
        expect(result.current).toBeUndefined()
    })

    it('returns Available for available status', () => {
        const { result } = renderHook(() =>
            useAvailabilityStatusText(
                {
                    user_id: 1,
                    user_status: 'available',
                    updated_datetime: '2024-01-01T00:00:00Z',
                } as UserAvailability,
                undefined,
            ),
        )
        expect(result.current).toBe('Available')
    })

    it('returns Unavailable for unavailable status', () => {
        const { result } = renderHook(() =>
            useAvailabilityStatusText(
                {
                    user_id: 1,
                    user_status: 'unavailable',
                    updated_datetime: '2024-01-01T00:00:00Z',
                } as UserAvailability,
                undefined,
            ),
        )
        expect(result.current).toBe('Unavailable')
    })

    it('returns custom status name without expiration', () => {
        const { result } = renderHook(() =>
            useAvailabilityStatusText(
                {
                    user_id: 1,
                    user_status: 'custom',
                    custom_user_availability_status_id: 'custom-1',
                    updated_datetime: '2024-01-01T00:00:00Z',
                } as UserAvailability,
                {
                    id: 'custom-1',
                    name: 'In a meeting',
                    created_datetime: '2024-01-01T00:00:00Z',
                    is_system: false,
                },
            ),
        )
        expect(result.current).toBe('In a meeting')
    })

    it('returns custom status name with formatted expiration time', () => {
        const { result } = renderHook(() =>
            useAvailabilityStatusText(
                {
                    user_id: 1,
                    user_status: 'custom',
                    custom_user_availability_status_id: 'custom-1',
                    custom_user_availability_status_expires_datetime:
                        '2024-01-01T17:58:00Z',
                    updated_datetime: '2024-01-01T00:00:00Z',
                } as UserAvailability,
                {
                    id: 'custom-1',
                    name: 'Lunch break',
                    created_datetime: '2024-01-01T00:00:00Z',
                    is_system: false,
                },
            ),
        )

        expect(result.current).toContain('Lunch break until')
        expect(result.current).toMatch(
            /Lunch break until \d{1,2}:\d{2} (AM|PM)/,
        )
    })

    it('returns undefined when custom status not provided', () => {
        const { result } = renderHook(() =>
            useAvailabilityStatusText(
                {
                    user_id: 1,
                    user_status: 'custom',
                    custom_user_availability_status_id: 'custom-1',
                    updated_datetime: '2024-01-01T00:00:00Z',
                } as UserAvailability,
                undefined,
            ),
        )
        expect(result.current).toBeUndefined()
    })
})
