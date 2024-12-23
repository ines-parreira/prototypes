import {renderHook} from '@testing-library/react-hooks'

import useGetBadgeTiers from 'pages/automate/aiAgent/insights/IntentTableWidget/BadgeWithTiers/hooks/useGetBadgeTiers'

describe('useGetBadgeTiers Hook', () => {
    test('should return a single tier when values array is empty', () => {
        const {result} = renderHook(() => useGetBadgeTiers([]))

        expect(result.current).toEqual([
            {
                range: [0, 0],
                background: '#FDF6FF',
                color: 'var(--accessory-magenta-3)',
            },
        ])
    })

    test('should return a single tier when values array has one element', () => {
        const {result} = renderHook(() => useGetBadgeTiers([50]))

        expect(result.current).toEqual([
            {
                range: [50, 50],
                background: '#FDF6FF',
                color: 'var(--accessory-magenta-3)',
            },
        ])
    })

    test('should return three tiers when values array has multiple elements', () => {
        const {result} = renderHook(() => useGetBadgeTiers([10, 50, 90]))

        expect(result.current).toEqual([
            {
                range: [10, 36.66666666666667],
                background: '#FDF6FF',
                color: 'var(--accessory-magenta-3)',
            },
            {
                range: [36.66666666666667, 63.333333333333336],
                background: 'var(--accessory-magenta-1)',
                color: 'var(--accessory-magenta-3)',
            },
            {
                range: [63.333333333333336, 90],
                background: 'var(--accessory-magenta-2)',
                color: 'var(--accessory-magenta-3)',
            },
        ])
    })

    test('should handle negative values correctly', () => {
        const {result} = renderHook(() => useGetBadgeTiers([-10, 0, 10]))

        expect(result.current).toEqual([
            {
                range: [-10, -3.333333333333333],
                background: '#FDF6FF',
                color: 'var(--accessory-magenta-3)',
            },
            {
                range: [-3.333333333333333, 3.333333333333334],
                background: 'var(--accessory-magenta-1)',
                color: 'var(--accessory-magenta-3)',
            },
            {
                range: [3.333333333333334, 10],
                background: 'var(--accessory-magenta-2)',
                color: 'var(--accessory-magenta-3)',
            },
        ])
    })

    test('should handle identical values in the array', () => {
        const {result} = renderHook(() => useGetBadgeTiers([50, 50, 50]))

        expect(result.current).toEqual([
            {
                range: [50, 50],
                background: '#FDF6FF',
                color: 'var(--accessory-magenta-3)',
            },
        ])
    })
})
