import { describe, expect, it } from 'vitest'

import { renderHook } from '../../tests/render.utils'
import { useAvailabilityStatusColor } from '../useAvailabilityStatusColor'

describe('useAvailabilityStatusColor', () => {
    describe('availability status mapping', () => {
        it.each([
            ['available' as const, 'green'],
            ['unavailable' as const, 'orange'],
            ['custom' as const, 'orange'],
        ])(
            'should return %s color when status is %s',
            (status, expectedColor) => {
                const { result } = renderHook(() =>
                    useAvailabilityStatusColor(status),
                )
                expect(result.current).toBe(expectedColor)
            },
        )

        it('should return undefined when status is not provided', () => {
            const { result } = renderHook(() => useAvailabilityStatusColor())
            expect(result.current).toBeUndefined()
        })

        it('should return undefined when status is undefined', () => {
            const { result } = renderHook(() =>
                useAvailabilityStatusColor(undefined),
            )
            expect(result.current).toBeUndefined()
        })
    })

    describe('phone status priority', () => {
        it('should return red when phone status is present (on-call)', () => {
            const { result } = renderHook(() =>
                useAvailabilityStatusColor('available', 'on-a-call'),
            )
            expect(result.current).toBe('red')
        })

        it('should return red when phone status is present (wrap-up)', () => {
            const { result } = renderHook(() =>
                useAvailabilityStatusColor('custom', 'call-wrap-up'),
            )
            expect(result.current).toBe('red')
        })

        it('should prioritize phone status over availability status', () => {
            const { result } = renderHook(() =>
                useAvailabilityStatusColor('available', 'on-a-call'),
            )
            expect(result.current).toBe('red')
        })

        it('should use availability status when phone status is undefined', () => {
            const { result } = renderHook(() =>
                useAvailabilityStatusColor('available', undefined),
            )
            expect(result.current).toBe('green')
        })
    })

    describe('edge cases', () => {
        it('should handle empty phone status string as no phone status', () => {
            const { result } = renderHook(() =>
                useAvailabilityStatusColor('available', ''),
            )
            expect(result.current).toBe('green')
        })

        it('should return undefined when no status provided even with empty phone status', () => {
            const { result } = renderHook(() =>
                useAvailabilityStatusColor(undefined, ''),
            )
            expect(result.current).toBeUndefined()
        })
    })
})
