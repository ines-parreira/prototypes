import { renderHook } from '@testing-library/react'

import { DisplayEventType } from 'domains/reporting/hooks/automate/automateStatsMeasureLabelMap'
import { useFilteredAutomatedInteractionTimeSeries } from 'domains/reporting/hooks/automate/useFilteredAutomatedInteractionTimeSeries'
import { getAutomateColorsForEventType } from 'domains/reporting/hooks/automate/utils'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    () => ({
        useIsArticleRecommendationsEnabledWhileSunset: jest.fn(),
    }),
)

describe('useFilteredAutomatedInteractionTimeSeries', () => {
    const mockUseIsArticleRecommendationsEnabledWhileSunset = jest.requireMock(
        'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    ).useIsArticleRecommendationsEnabledWhileSunset

    const mockTimeSeriesData = [
        {
            label: DisplayEventType.WORKFLOWS,
            values: [{ x: '2023-01-01', y: 10 }],
        },
        {
            label: DisplayEventType.ARTICLE_RECOMMENDATION,
            values: [{ x: '2023-01-01', y: 20 }],
        },
        {
            label: DisplayEventType.AI_AGENT,
            values: [{ x: '2023-01-01', y: 30 }],
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should filter out article recommendations when feature is disabled', () => {
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInStatistics: false,
        })

        const { result } = renderHook(() =>
            useFilteredAutomatedInteractionTimeSeries({
                automatedInteractionByEventTypesTimeSeriesData:
                    mockTimeSeriesData,
            }),
        )

        expect(result.current.filteredData).toHaveLength(2)
        expect(result.current.filteredData).not.toContainEqual(
            expect.objectContaining({
                label: DisplayEventType.ARTICLE_RECOMMENDATION,
            }),
        )
        expect(result.current.isArticleRecommendationsEnabled).toBe(false)
    })

    it('should include all data when article recommendations feature is enabled', () => {
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInStatistics: true,
        })

        const { result } = renderHook(() =>
            useFilteredAutomatedInteractionTimeSeries({
                automatedInteractionByEventTypesTimeSeriesData:
                    mockTimeSeriesData,
            }),
        )

        expect(result.current.filteredData).toHaveLength(3)
        expect(result.current.filteredData).toContainEqual(
            expect.objectContaining({
                label: DisplayEventType.ARTICLE_RECOMMENDATION,
            }),
        )
        expect(result.current.isArticleRecommendationsEnabled).toBe(true)
    })

    it('should return correct colors for filtered data', () => {
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInStatistics: false,
        })

        const { result } = renderHook(() =>
            useFilteredAutomatedInteractionTimeSeries({
                automatedInteractionByEventTypesTimeSeriesData:
                    mockTimeSeriesData,
            }),
        )

        const expectedColors = [
            getAutomateColorsForEventType(DisplayEventType.WORKFLOWS),
            getAutomateColorsForEventType(DisplayEventType.AI_AGENT),
        ]

        expect(result.current.colors).toEqual(expectedColors)
    })

    it('should handle empty data', () => {
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInStatistics: true,
        })

        const { result } = renderHook(() =>
            useFilteredAutomatedInteractionTimeSeries({
                automatedInteractionByEventTypesTimeSeriesData: [],
            }),
        )

        expect(result.current.filteredData).toHaveLength(0)
        expect(result.current.colors).toHaveLength(0)
    })

    it('should memoize results when dependencies do not change', () => {
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabled: true,
        })

        const { result, rerender } = renderHook(() =>
            useFilteredAutomatedInteractionTimeSeries({
                automatedInteractionByEventTypesTimeSeriesData:
                    mockTimeSeriesData,
            }),
        )

        const firstResult = result.current

        rerender()

        expect(result.current.filteredData).toBe(firstResult.filteredData)
        expect(result.current.colors).toBe(firstResult.colors)
    })
})
