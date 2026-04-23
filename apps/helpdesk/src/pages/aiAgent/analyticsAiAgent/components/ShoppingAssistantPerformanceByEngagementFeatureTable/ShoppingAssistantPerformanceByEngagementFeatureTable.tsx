import { ReportingMetricBreakdownTable } from '@repo/reporting'

import {
    SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS,
    SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/columns'
import { DownloadShoppingAssistantPerformanceByEngagementFeatureButton } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/DownloadShoppingAssistantPerformanceByEngagementFeatureButton'
import { useShoppingAssistantPerformanceByEngagementFeatureMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantPerformanceByEngagementFeatureMetrics'

type Props = {
    chartId?: string
}

export const ShoppingAssistantPerformanceByEngagementFeatureTable = ({
    chartId,
}: Props) => {
    const { data = [], loadingStates } =
        useShoppingAssistantPerformanceByEngagementFeatureMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={
                SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS
            }
            loadingStates={loadingStates}
            DownloadButton={
                <DownloadShoppingAssistantPerformanceByEngagementFeatureButton />
            }
            nameColumns={
                SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_NAME_COLUMNS
            }
            chartId={chartId}
        />
    )
}
