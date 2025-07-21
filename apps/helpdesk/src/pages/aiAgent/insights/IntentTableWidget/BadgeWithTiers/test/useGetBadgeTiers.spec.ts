import useGetBadgeTiers from 'pages/aiAgent/insights/IntentTableWidget/BadgeWithTiers/hooks/useGetBadgeTiers'
import { renderHook } from 'utils/testing/renderHook'

describe('useGetBadgeTiers Hook', () => {
    test('should return a single tier when values array is empty', () => {
        const { result } = renderHook(() => useGetBadgeTiers([]))

        expect(result.current).toEqual([
            {
                range: [0, 0],
                background: 'var(--accessory-magenta-1)',
                color: 'var(--accessory-magenta-3)',
            },
        ])
    })

    test('should return a single tier when values array has one element', () => {
        const { result } = renderHook(() => useGetBadgeTiers([50]))

        expect(result.current).toEqual([
            {
                range: [50, 50],
                background: 'var(--accessory-magenta-1)',
                color: 'var(--accessory-magenta-3)',
            },
        ])
    })

    test('should return three tiers when values array has multiple elements', () => {
        const { result } = renderHook(() => useGetBadgeTiers([10, 50]))

        expect(result.current).toEqual([
            {
                range: [10, 30],
                background: 'var(--accessory-magenta-1)',
                color: 'var(--accessory-magenta-3)',
            },
            {
                range: [30, 50],
                background: 'var(--accessory-magenta-2)',
                color: 'var(--accessory-magenta-3)',
            },
        ])
    })

    test('should handle negative values correctly', () => {
        const { result } = renderHook(() => useGetBadgeTiers([-10, 0, 10]))

        expect(result.current).toEqual([
            {
                range: [-10, 0],
                background: 'var(--accessory-magenta-1)',
                color: 'var(--accessory-magenta-3)',
            },
            {
                range: [0, 10],
                background: 'var(--accessory-magenta-2)',
                color: 'var(--accessory-magenta-3)',
            },
        ])
    })

    test('should handle identical values in the array', () => {
        const { result } = renderHook(() => useGetBadgeTiers([50, 50, 50]))

        expect(result.current).toEqual([
            {
                range: [50, 50],
                background: 'var(--accessory-magenta-1)',
                color: 'var(--accessory-magenta-3)',
            },
        ])
    })
})
