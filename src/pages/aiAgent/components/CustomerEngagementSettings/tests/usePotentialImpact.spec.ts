import { renderHook } from 'utils/testing/renderHook'

import {
    computeRoundedPotentialImpact,
    usePotentialImpact,
} from '../hooks/usePotentialImpact'
import {
    lessThanAWeekData,
    monthlyData,
    nearZeroData,
    zeroData,
} from './fixtures'

const mockDate = new Date('2025-05-05T00:00:00Z')

describe('computeRoundedPotentialImpact', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(mockDate)
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    it('should return null if there is no data with value > 0', () => {
        expect(
            computeRoundedPotentialImpact(0.03, [
                [{ dateTime: '2023-01-01', value: 0 }],
            ]),
        ).toBeNull()
    })

    it('should return null if the first data point is less than 7 days old', () => {
        const result = computeRoundedPotentialImpact(0.03, [lessThanAWeekData])

        expect(result).toBeNull()
    })

    it('should compute multiplier using first day of data and use the estimate to compute the potential influenced GMV', () => {
        const result = computeRoundedPotentialImpact(0.03, [monthlyData])

        const expectedLowerImpact = 250
        const expectedUpperImpact = 370

        expect(result).toEqual({
            lowerImpact: expectedLowerImpact,
            upperImpact: expectedUpperImpact,
        })
    })
})

describe('usePotentialImpact', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(mockDate)
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    it('should return potentialImpact = null when data is empty', () => {
        const { result } = renderHook(() => usePotentialImpact(0.03, []))

        expect(result.current).toEqual(null)
    })

    it('should return potentialImpact = null when data is undefined', () => {
        const { result } = renderHook(() => usePotentialImpact(0.03, undefined))

        expect(result.current).toEqual(null)
    })

    it('should return potentialImpact = null when data is only zeros', () => {
        const { result } = renderHook(() =>
            usePotentialImpact(0.03, [zeroData]),
        )

        expect(result.current).toEqual(null)
    })

    it('should return potentialImpact = null when lower and upper impact is 0', () => {
        const { result } = renderHook(() =>
            usePotentialImpact(0.03, [nearZeroData]),
        )

        expect(result.current).toEqual(null)
    })

    it('should return correctly formatted potentialImpact when data is valid', () => {
        const { result } = renderHook(() =>
            usePotentialImpact(0.03, [monthlyData]),
        )

        expect(result.current).toEqual(
            'Unlock between $250 and $370 of additional GMV.',
        )
    })
})
