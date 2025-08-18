import { renderHook } from '@testing-library/react'

import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyConversionRate } from '../useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from '../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyResponseRate } from '../useAIJourneyResponseRate/useAIJourneyResponseRate'
import { useAbandonedCartKpis } from './useAbandonedCartKpis'

jest.mock('domains/reporting/state/ui/stats/selectors')
jest.mock('hooks/useAppSelector')
jest.mock('../useAIJourneyConversionRate/useAIJourneyConversionRate')
jest.mock('../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced')
jest.mock('../useAIJourneyTotalOrders/useAIJourneyTotalOrders')
jest.mock('../useClickThroughRate/useClickThroughRate')
jest.mock('../useAIJourneyResponseRate/useAIJourneyResponseRate')

describe('useAbandonedCartKpis', () => {
    const mockUseAppSelector = useAppSelector as jest.Mock
    const mockUseAIJourneyGmvInfluenced = useAIJourneyGmvInfluenced as jest.Mock
    const mockUseAIJourneyConversionRate =
        useAIJourneyConversionRate as jest.Mock
    const mockUseAIJourneyResponseRate = useAIJourneyResponseRate as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockReturnValue({
            userTimezone: 'America/New_York',
        })

        jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00Z'))

        mockUseAIJourneyGmvInfluenced.mockReturnValue({
            label: 'GMV',
            value: '1000',
        })
        mockUseAIJourneyConversionRate.mockReturnValue({
            label: 'Conversion Rate',
            value: '5%',
        })
        mockUseAIJourneyResponseRate.mockReturnValue({
            label: 'Response Rate',
            value: '10%',
        })
    })

    it('should return KPIs in correct order', () => {
        const { result } = renderHook(() =>
            useAbandonedCartKpis('123', 'shopName'),
        )

        expect(result.current.metrics).toHaveLength(3)
        expect(result.current.metrics[0]).toEqual({
            label: 'GMV',
            value: '1000',
        })
        expect(result.current.metrics[1]).toEqual({
            label: 'Conversion Rate',
            value: '5%',
        })
        expect(result.current.metrics[2]).toEqual({
            label: 'Response Rate',
            value: '10%',
        })
    })

    it('should call all KPI hooks with correct parameters', () => {
        const expectedFilters = {
            period: {
                start_datetime: '2023-12-04T00:00:00Z',
                end_datetime: '2024-01-01T23:59:59Z',
            },
        }

        renderHook(() => useAbandonedCartKpis('123', 'journey-id'))

        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            ReportingGranularity.Week,
            'journey-id',
        )
        expect(mockUseAIJourneyConversionRate).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            ReportingGranularity.Week,
            'journey-id',
        )
        expect(mockUseAIJourneyResponseRate).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            ReportingGranularity.Week,
            'journey-id',
        )
    })

    it('should use userTimezone from selector', () => {
        mockUseAppSelector.mockReturnValue({
            userTimezone: 'Europe/London',
        })

        renderHook(() => useAbandonedCartKpis('123', 'journey-id'))

        expect(mockUseAppSelector).toHaveBeenCalledWith(
            getCleanStatsFiltersWithTimezone,
        )
        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
            'journey-id',
        )
        expect(mockUseAIJourneyConversionRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
            'journey-id',
        )
        expect(mockUseAIJourneyResponseRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
            'journey-id',
        )
    })

    it('should call with journeyID correctly', () => {
        mockUseAppSelector.mockReturnValue({
            userTimezone: 'Europe/London',
        })

        renderHook(() => useAbandonedCartKpis('123', 'journey-id'))

        expect(mockUseAppSelector).toHaveBeenCalledWith(
            getCleanStatsFiltersWithTimezone,
        )
        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
            'journey-id',
        )
        expect(mockUseAIJourneyConversionRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
            'journey-id',
        )
        expect(mockUseAIJourneyResponseRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
            'journey-id',
        )
    })
})
