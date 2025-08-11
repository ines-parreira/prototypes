import { renderHook } from '@testing-library/react'
import moment from 'moment'

import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyConversionRate } from '../useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from '../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyTotalOrders } from '../useAIJourneyTotalOrders/useAIJourneyTotalOrders'
import { useClickThroughRate } from '../useClickThroughRate/useClickThroughRate'
import { useAIJourneyKpis } from './useAIJourneyKpis'

jest.mock('moment')
jest.mock('domains/reporting/state/ui/stats/selectors')
jest.mock('hooks/useAppSelector')
jest.mock('../useAIJourneyConversionRate/useAIJourneyConversionRate')
jest.mock('../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced')
jest.mock('../useAIJourneyTotalOrders/useAIJourneyTotalOrders')
jest.mock('../useClickThroughRate/useClickThroughRate')

describe('useAIJourneyKpis', () => {
    const mockMoment = moment as jest.MockedFunction<typeof moment>
    const mockUseAppSelector = useAppSelector as jest.Mock
    const mockUseAIJourneyGmvInfluenced = useAIJourneyGmvInfluenced as jest.Mock
    const mockUseAIJourneyTotalOrders = useAIJourneyTotalOrders as jest.Mock
    const mockUseAIJourneyConversionRate =
        useAIJourneyConversionRate as jest.Mock
    const mockUseClickThroughRate = useClickThroughRate as jest.Mock

    const mockMomentInstance = {
        subtract: jest.fn().mockReturnThis(),
        startOf: jest.fn().mockReturnThis(),
        endOf: jest.fn().mockReturnThis(),
        format: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockReturnValue({
            userTimezone: 'America/New_York',
        })

        mockMoment.mockReturnValue(mockMomentInstance as any)
        mockMomentInstance.format.mockReturnValueOnce('2024-01-01T00:00:00Z')
        mockMomentInstance.format.mockReturnValueOnce('2024-01-29T23:59:59Z')

        mockUseAIJourneyGmvInfluenced.mockReturnValue({
            label: 'GMV',
            value: '1000',
        })
        mockUseAIJourneyTotalOrders.mockReturnValue({
            label: 'Total Orders',
            value: '50',
        })
        mockUseAIJourneyConversionRate.mockReturnValue({
            label: 'Conversion Rate',
            value: '5%',
        })
        mockUseClickThroughRate.mockReturnValue({ label: 'CTR', value: '10%' })
    })

    it('should return KPIs in correct order', () => {
        const { result } = renderHook(() => useAIJourneyKpis('123', 'shopName'))

        expect(result.current).toHaveLength(4)
        expect(result.current[0]).toEqual({ label: 'GMV', value: '1000' })
        expect(result.current[1]).toEqual({
            label: 'Total Orders',
            value: '50',
        })
        expect(result.current[2]).toEqual({
            label: 'Conversion Rate',
            value: '5%',
        })
        expect(result.current[3]).toEqual({ label: 'CTR', value: '10%' })
    })

    it('should create filters with 30 days period', () => {
        renderHook(() => useAIJourneyKpis('123', 'shopName'))

        expect(mockMoment).toHaveBeenCalledTimes(2)
        expect(mockMomentInstance.subtract).toHaveBeenCalledWith(30, 'days')
        expect(mockMomentInstance.startOf).toHaveBeenCalledWith('day')
        expect(mockMomentInstance.endOf).toHaveBeenCalledWith('day')
    })

    it('should call all KPI hooks with correct parameters', () => {
        const expectedFilters = {
            period: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-29T23:59:59Z',
            },
        }

        renderHook(() => useAIJourneyKpis('123', 'shopName'))

        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            undefined,
        )
        expect(mockUseAIJourneyTotalOrders).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            undefined,
        )
        expect(mockUseAIJourneyConversionRate).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            undefined,
        )
        expect(mockUseClickThroughRate).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            'shopName',
            undefined,
        )
    })

    it('should use userTimezone from selector', () => {
        mockUseAppSelector.mockReturnValue({
            userTimezone: 'Europe/London',
        })

        renderHook(() => useAIJourneyKpis('123', 'shopName'))

        expect(mockUseAppSelector).toHaveBeenCalledWith(
            getCleanStatsFiltersWithTimezone,
        )
        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            undefined,
        )
        expect(mockUseAIJourneyTotalOrders).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            undefined,
        )
        expect(mockUseAIJourneyConversionRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            undefined,
        )
        expect(mockUseClickThroughRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            'shopName',
            undefined,
        )
    })

    it('should call with journeyID correctly', () => {
        mockUseAppSelector.mockReturnValue({
            userTimezone: 'Europe/London',
        })

        renderHook(() => useAIJourneyKpis('123', 'shopName', 'journey-id'))

        expect(mockUseAppSelector).toHaveBeenCalledWith(
            getCleanStatsFiltersWithTimezone,
        )
        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            'journey-id',
        )
        expect(mockUseAIJourneyTotalOrders).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            'journey-id',
        )
        expect(mockUseAIJourneyConversionRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            'journey-id',
        )
        expect(mockUseClickThroughRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            'shopName',
            'journey-id',
        )
    })

    it('should memoize filters correctly', () => {
        const { rerender } = renderHook(() =>
            useAIJourneyKpis('123', 'shopName'),
        )

        // Clear the mocks after first render
        jest.clearAllMocks()
        mockUseAppSelector.mockReturnValue({
            userTimezone: 'America/New_York',
        })

        // Rerender without changing dependencies
        rerender()

        // moment should not be called again due to memoization
        expect(mockMoment).not.toHaveBeenCalled()
    })
})
