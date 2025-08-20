import { renderHook } from '@testing-library/react'

import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyConversionRate } from '../useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from '../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyResponseRate } from '../useAIJourneyResponseRate/useAIJourneyResponseRate'
import { useAIJourneyTotalOrders } from '../useAIJourneyTotalOrders/useAIJourneyTotalOrders'
import { useClickThroughRate } from '../useClickThroughRate/useClickThroughRate'
import { useAIJourneyKpis } from './useAIJourneyKpis'

jest.mock('domains/reporting/state/ui/stats/selectors')
jest.mock('hooks/useAppSelector')
jest.mock('../useAIJourneyConversionRate/useAIJourneyConversionRate')
jest.mock('../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced')
jest.mock('../useAIJourneyTotalOrders/useAIJourneyTotalOrders')
jest.mock('../useClickThroughRate/useClickThroughRate')
jest.mock('../useAIJourneyResponseRate/useAIJourneyResponseRate')

describe('useAIJourneyKpis', () => {
    const mockUseAppSelector = useAppSelector as jest.Mock
    const mockUseAIJourneyGmvInfluenced = useAIJourneyGmvInfluenced as jest.Mock
    const mockUseAIJourneyTotalOrders = useAIJourneyTotalOrders as jest.Mock
    const mockUseAIJourneyConversionRate =
        useAIJourneyConversionRate as jest.Mock
    const mockUseClickThroughRate = useClickThroughRate as jest.Mock
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
        mockUseAIJourneyTotalOrders.mockReturnValue({
            label: 'Total Orders',
            value: '50',
        })
        mockUseAIJourneyConversionRate.mockReturnValue({
            label: 'Conversion Rate',
            value: '5%',
        })
        mockUseClickThroughRate.mockReturnValue({ label: 'CTR', value: '10%' })
        mockUseAIJourneyResponseRate.mockReturnValue({
            label: 'Click Through Rate',
            value: 10,
        })
    })

    it('should return KPIs in correct order', () => {
        const { result } = renderHook(() => useAIJourneyKpis('123', 'shopName'))

        expect(result.current.metrics).toHaveLength(5)
        expect(result.current.metrics[0]).toEqual({
            label: 'GMV',
            value: '1000',
        })
        expect(result.current.metrics[1]).toEqual({
            label: 'Total Orders',
            value: '50',
        })
        expect(result.current.metrics[2]).toEqual({
            label: 'Conversion Rate',
            value: '5%',
        })
        expect(result.current.metrics[3]).toEqual({
            label: 'CTR',
            value: '10%',
        })
        expect(result.current.metrics[4]).toEqual({
            label: 'Click Through Rate',
            value: 10,
        })
    })

    it('should call all KPI hooks with correct parameters', () => {
        const expectedFilters = {
            period: {
                start_datetime: '2023-12-04T00:00:00Z',
                end_datetime: '2024-01-01T23:59:59Z',
            },
        }

        renderHook(() => useAIJourneyKpis('123'))

        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            ReportingGranularity.Week,
        )
        expect(mockUseAIJourneyTotalOrders).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            ReportingGranularity.Week,
        )
        expect(mockUseAIJourneyConversionRate).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            ReportingGranularity.Week,
        )
        expect(mockUseClickThroughRate).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            ReportingGranularity.Week,
        )
        expect(mockUseAIJourneyResponseRate).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            expectedFilters,
            ReportingGranularity.Week,
        )
    })

    it('should use userTimezone from selector', () => {
        mockUseAppSelector.mockReturnValue({
            userTimezone: 'Europe/London',
        })

        renderHook(() => useAIJourneyKpis('123'))

        expect(mockUseAppSelector).toHaveBeenCalledWith(
            getCleanStatsFiltersWithTimezone,
        )
        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
        )
        expect(mockUseAIJourneyTotalOrders).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
        )
        expect(mockUseAIJourneyConversionRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
        )
        expect(mockUseClickThroughRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
        )
        expect(mockUseAIJourneyResponseRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
        )
    })
})
