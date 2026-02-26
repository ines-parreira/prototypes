import { useMemo } from 'react'

import { DisplayEventType } from 'domains/reporting/hooks/automate/automateStatsMeasureLabelMap'
import { getAutomateColorsForEventType } from 'domains/reporting/hooks/automate/utils'
import type { TwoDimensionalDataItem } from 'domains/reporting/pages/types'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'

interface UseFilteredAutomatedInteractionTimeSeriesProps {
    automatedInteractionByEventTypesTimeSeriesData: TwoDimensionalDataItem[]
}

export const useFilteredAutomatedInteractionTimeSeries = ({
    automatedInteractionByEventTypesTimeSeriesData,
}: UseFilteredAutomatedInteractionTimeSeriesProps) => {
    const { enabledInStatistics: isArticleRecommendationsEnabledWhileSunset } =
        useIsArticleRecommendationsEnabledWhileSunset()

    const filteredData = useMemo(() => {
        if (!isArticleRecommendationsEnabledWhileSunset) {
            return automatedInteractionByEventTypesTimeSeriesData.filter(
                (data) =>
                    data.label !== DisplayEventType.ARTICLE_RECOMMENDATION,
            )
        }
        return automatedInteractionByEventTypesTimeSeriesData
    }, [
        automatedInteractionByEventTypesTimeSeriesData,
        isArticleRecommendationsEnabledWhileSunset,
    ])

    const colors = useMemo(() => {
        return filteredData.map((data) =>
            getAutomateColorsForEventType(data.label),
        )
    }, [filteredData])

    return {
        filteredData,
        colors,
        isArticleRecommendationsEnabled:
            isArticleRecommendationsEnabledWhileSunset,
    }
}
