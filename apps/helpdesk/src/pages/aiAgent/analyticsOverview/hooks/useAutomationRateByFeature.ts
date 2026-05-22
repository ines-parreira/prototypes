import type { ChartDataItem } from '@repo/reporting'

import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import { automationRatePerFeatureQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

const MAP_DIMENSION_API_TO_UI: Record<string, string> = {
    [AutomationFeatureType.AiAgent]: 'AI Agent',
    [AutomationFeatureType.Flows]: 'Flows',
    [AutomationFeatureType.OrderManagement]: 'Order Management',
    [AutomationFeatureType.ArticleRecommendation]: 'Article Recommendation',
}

export const useAutomationRateByFeature = (): {
    data: ChartDataItem[]
    isLoading: boolean
    isError: boolean
} => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const response = useStatsMetricPerDimension(
        automationRatePerFeatureQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        'automationFeatureType',
    )

    return {
        isLoading: response.isFetching,
        isError: response.isError,
        data:
            response.data?.allValues
                ?.filter((metricValue) =>
                    Object.keys(MAP_DIMENSION_API_TO_UI).includes(
                        metricValue.dimension.toString(),
                    ),
                )
                .map((metricValue) => {
                    return {
                        name: MAP_DIMENSION_API_TO_UI[
                            metricValue.dimension.toString()
                        ],
                        value: metricValue.value,
                    }
                }) ?? [],
    }
}

export const fetchAutomationRateByFeatureData = (
    statsFilters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricPerDimension(
        automationRatePerFeatureQueryFactoryV2({
            filters: statsFilters,
            timezone,
        }),
        'automationFeatureType',
    )
