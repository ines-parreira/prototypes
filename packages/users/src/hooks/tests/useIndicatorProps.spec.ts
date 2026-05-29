import { renderHook } from '@repo/testing/vitest'
import { describe, expect, it } from 'vitest'

import { useIndicatorProps } from '../useIndicatorProps'

describe('useIndicatorProps', () => {
    it('returns grey/Offline when the user is offline regardless of availability', () => {
        const { result } = renderHook(() =>
            useIndicatorProps({
                isOnline: false,
                availabilityStatus: 'available',
            }),
        )
        expect(result.current).toEqual({
            color: 'grey',
            'aria-label': 'Offline',
        })
    })

    it('returns green/Available when online and chosen status is available', () => {
        const { result } = renderHook(() =>
            useIndicatorProps({
                isOnline: true,
                availabilityStatus: 'available',
            }),
        )
        expect(result.current).toEqual({
            color: 'green',
            'aria-label': 'Available',
        })
    })

    it.each(['unavailable', 'custom'] as const)(
        'returns orange/Unavailable when online and chosen status is %s',
        (availabilityStatus) => {
            const { result } = renderHook(() =>
                useIndicatorProps({ isOnline: true, availabilityStatus }),
            )
            expect(result.current).toEqual({
                color: 'orange',
                'aria-label': 'Unavailable',
            })
        },
    )

    it('falls back to green/Online when online without availability data', () => {
        const { result } = renderHook(() =>
            useIndicatorProps({ isOnline: true }),
        )
        expect(result.current).toEqual({
            color: 'green',
            'aria-label': 'Online',
        })
    })
})
