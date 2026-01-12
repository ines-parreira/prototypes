import { renderHook } from '@testing-library/react'

import { useAIJourneyConversionRate } from 'AIJourney/hooks/useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from 'AIJourney/hooks/useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyResponseRate } from 'AIJourney/hooks/useAIJourneyResponseRate/useAIJourneyResponseRate'
import { useAIJourneyRevenuePerRecipient } from 'AIJourney/hooks/useAIJourneyRevenuePerRecipient/useAIJourneyRevenuePerRecipient'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { useCampaignsKpis } from './useCampaignsKpis'

jest.mock('domains/reporting/state/ui/stats/selectors')
jest.mock('hooks/useAppSelector')
jest.mock(
    'AIJourney/hooks/useAIJourneyConversionRate/useAIJourneyConversionRate',
)
jest.mock('AIJourney/hooks/useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('AIJourney/hooks/useAIJourneyResponseRate/useAIJourneyResponseRate')
jest.mock(
    'AIJourney/hooks/useAIJourneyRevenuePerRecipient/useAIJourneyRevenuePerRecipient',
)
jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

describe('useCampaignsKpis', () => {
    const mockUseAppSelector = useAppSelector as jest.Mock
    const mockUseAIJourneyGmvInfluenced = useAIJourneyGmvInfluenced as jest.Mock
    const mockUseAIJourneyConversionRate =
        useAIJourneyConversionRate as jest.Mock
    const mockUseAIJourneyResponseRate = useAIJourneyResponseRate as jest.Mock
    const mockUseAIJourneyRevenuePerRecipient =
        useAIJourneyRevenuePerRecipient as jest.Mock
    const mockUseJourneyContext =
        require('AIJourney/providers/JourneyProvider/JourneyProvider')
            .useJourneyContext as jest.Mock
    const filters = {
        period: {
            start_datetime: '2025-08-07T00:00:00.000Z',
            end_datetime: '2025-09-04T23:59:59.999Z',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockReturnValue({
            userTimezone: 'America/New_York',
        })

        jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00Z'))

        mockUseAIJourneyGmvInfluenced.mockReturnValue({
            label: 'GMV influenced',
            value: 1000,
        })
        mockUseAIJourneyRevenuePerRecipient.mockReturnValue({
            label: 'Revenue per recipient',
            value: 50,
        })
        mockUseAIJourneyConversionRate.mockReturnValue({
            label: 'Conversion rate',
            value: 5,
        })
        mockUseAIJourneyResponseRate.mockReturnValue({
            label: 'Response rate',
            value: 10,
        })

        mockUseJourneyContext.mockReturnValue({
            currency: 'USD',
        })
    })

    it('should return KPIs in correct order', () => {
        const { result } = renderHook(() =>
            useCampaignsKpis({
                integrationId: '123',
                filters,
                journeyIds: ['journey1', 'journey2'],
            }),
        )

        expect(result.current.metrics).toHaveLength(4)
        expect(result.current.metrics[0]).toEqual({
            label: 'GMV influenced',
            value: 1000,
        })
        expect(result.current.metrics[1]).toEqual({
            label: 'Revenue per recipient',
            value: 50,
        })
        expect(result.current.metrics[2]).toEqual({
            label: 'Conversion rate',
            value: 5,
        })
        expect(result.current.metrics[3]).toEqual({
            label: 'Response rate',
            value: 10,
        })
    })

    it('should call all KPI hooks with correct parameters', () => {
        const journeyIds = ['journey1', 'journey2']
        renderHook(() =>
            useCampaignsKpis({
                integrationId: '123',
                filters,
                journeyIds,
            }),
        )

        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            filters,
            'USD',
            ReportingGranularity.Week,
            journeyIds,
        )
        expect(mockUseAIJourneyConversionRate).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            filters,
            ReportingGranularity.Week,
            journeyIds,
        )
        expect(mockUseAIJourneyResponseRate).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            filters,
            ReportingGranularity.Week,
            journeyIds,
        )
        expect(mockUseAIJourneyRevenuePerRecipient).toHaveBeenCalledWith(
            '123',
            'America/New_York',
            filters,
            journeyIds,
        )
    })

    it('should use userTimezone from selector', () => {
        mockUseAppSelector.mockReturnValue({
            userTimezone: 'Europe/London',
        })

        const journeyIds = ['journey1']
        renderHook(() =>
            useCampaignsKpis({
                integrationId: '123',
                filters,
                journeyIds,
            }),
        )

        expect(mockUseAppSelector).toHaveBeenCalledWith(
            getCleanStatsFiltersWithTimezone,
        )
        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            'USD',
            ReportingGranularity.Week,
            journeyIds,
        )
        expect(mockUseAIJourneyConversionRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
            journeyIds,
        )
        expect(mockUseAIJourneyResponseRate).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            ReportingGranularity.Week,
            journeyIds,
        )
        expect(mockUseAIJourneyRevenuePerRecipient).toHaveBeenCalledWith(
            '123',
            'Europe/London',
            expect.any(Object),
            journeyIds,
        )
    })
})
