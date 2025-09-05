import { renderHook } from '@testing-library/react'

import { useFilters } from './useFilters'

describe('useFilters', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date('2025-09-04T12:00:00Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should return a 28-day period filter ending at current day', () => {
        const { result } = renderHook(() => useFilters())

        expect(result.current).toEqual({
            period: {
                start_datetime: '2025-08-07T00:00:00.000Z',
                end_datetime: '2025-09-04T23:59:59.999Z',
            },
        })
    })
})
