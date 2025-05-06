import { UseQueryResult } from '@tanstack/react-query'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { useGmvUsdOverTimeSeries } from 'pages/stats/automate/aiSalesAgent/metrics/useGmvUsdOverTimeSeries'
import { getTimezone } from 'state/currentUser/selectors'
import { assumeMock } from 'utils/testing'
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

jest.mock(
    'pages/stats/automate/aiSalesAgent/metrics/useGmvUsdOverTimeSeries',
    () => ({
        useGmvUsdOverTimeSeries: jest.fn(),
    }),
)
jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())
jest.mock('state/currentUser/selectors', () => ({
    getTimezone: jest.fn(),
}))

const useGmvUsdOverTimeSeriesMock = assumeMock(useGmvUsdOverTimeSeries)
const getTimezoneMock = assumeMock(getTimezone)

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
            computeRoundedPotentialImpact([
                [{ dateTime: '2023-01-01', value: 0 }],
            ]),
        ).toBeNull()
    })

    it('should return null if the first data point is less than 7 days old', () => {
        const result = computeRoundedPotentialImpact([lessThanAWeekData])

        expect(result).toBeNull()
    })

    it('should compute multiplier using first day of data and use the estimate to compute the potential influenced GMV', () => {
        const result = computeRoundedPotentialImpact([monthlyData])

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

        useGmvUsdOverTimeSeriesMock.mockReturnValue({
            data: [],
            error: null,
            isLoading: false,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)
        getTimezoneMock.mockReturnValue('UTC')
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    it('should call useGmvUsdOverTimeSeries with the correct parameters', () => {
        renderHook(() => usePotentialImpact(123))

        expect(useGmvUsdOverTimeSeriesMock).toHaveBeenCalledWith(
            {
                period: {
                    end_datetime: '2025-05-05T00:00:00.000Z',
                    start_datetime: '2025-04-05T00:00:00.000Z',
                },
                storeIntegrations: {
                    operator: 'one-of',
                    values: [123],
                },
            },
            'UTC',
            ReportingGranularity.Day,
        )
    })

    it('should return isPotentialImpactLoading = true when query is loading', () => {
        useGmvUsdOverTimeSeriesMock.mockReturnValue({
            data: [],
            error: null,
            isLoading: true,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)

        const { result } = renderHook(usePotentialImpact)

        expect(result.current.isPotentialImpactLoading).toEqual(true)
    })

    it('should return potentialImpact = null when query has an error', () => {
        useGmvUsdOverTimeSeriesMock.mockReturnValue({
            data: [],
            error: 'Error!',
            isLoading: false,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)

        const { result } = renderHook(usePotentialImpact)

        expect(result.current.potentialImpact).toEqual(null)
    })

    it('should return potentialImpact = null when data is empty', () => {
        useGmvUsdOverTimeSeriesMock.mockReturnValue({
            data: [],
            error: null,
            isLoading: false,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)

        const { result } = renderHook(usePotentialImpact)

        expect(result.current.potentialImpact).toEqual(null)
    })

    it('should return potentialImpact = null when data is undefined', () => {
        useGmvUsdOverTimeSeriesMock.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: false,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)

        const { result } = renderHook(usePotentialImpact)

        expect(result.current.potentialImpact).toEqual(null)
    })

    it('should return potentialImpact = null when data is only zeros', () => {
        useGmvUsdOverTimeSeriesMock.mockReturnValue({
            data: [zeroData],
            error: null,
            isLoading: false,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)

        const { result } = renderHook(usePotentialImpact)

        expect(result.current.potentialImpact).toEqual(null)
    })

    it('should return potentialImpact = null when lower and upper impact is 0', () => {
        useGmvUsdOverTimeSeriesMock.mockReturnValue({
            data: [nearZeroData],
            error: null,
            isLoading: false,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)

        const { result } = renderHook(usePotentialImpact)

        expect(result.current.potentialImpact).toEqual(null)
    })

    it('should return correctly formatted potentialImpact when data is valid', () => {
        useGmvUsdOverTimeSeriesMock.mockReturnValue({
            data: [monthlyData],
            error: null,
            isLoading: false,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)

        const { result } = renderHook(usePotentialImpact)

        expect(result.current.potentialImpact).toEqual(
            'Unlock between $250 and $370 of additional GMV.',
        )
    })
})
