import { describe, expect, it } from 'vitest'

import type { UserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../tests/render.utils'
import { useAvailabilityStatusColor } from '../useAvailabilityStatusColor'

describe('useAvailabilityStatusColor', () => {
    it.each([
        ['available' as const, 'green'],
        ['unavailable' as const, 'red'],
        ['custom' as const, 'orange'],
    ])('returns %s maps to %s', (status, expectedColor) => {
        const { result } = renderHook(() => useAvailabilityStatusColor(status))
        expect(result.current).toBe(expectedColor)
    })

    it('should update color on status change (rerender)', () => {
        const { result, rerender } = renderHook(
            (props: { status: UserAvailabilityStatus }) =>
                useAvailabilityStatusColor(props.status),
            { initialProps: { status: 'available' } },
        )
        expect(result.current).toBe('green')
        rerender({ status: 'unavailable' })
        expect(result.current).toBe('red')
    })
})
