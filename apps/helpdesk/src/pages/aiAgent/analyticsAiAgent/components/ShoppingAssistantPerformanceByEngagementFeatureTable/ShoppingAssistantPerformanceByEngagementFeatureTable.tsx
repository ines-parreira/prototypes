import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/columns'
import { DownloadShoppingAssistantPerformanceByEngagementFeatureButton } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/DownloadShoppingAssistantPerformanceByEngagementFeatureButton'
import { useShoppingAssistantPerformanceByEngagementFeatureMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantPerformanceByEngagementFeatureMetrics'
import { MAP_ENGAGEMENT_TYPE_NAME } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

export const ShoppingAssistantPerformanceByEngagementFeatureTable = () => {
    const { data = [], loadingStates } =
        useShoppingAssistantPerformanceByEngagementFeatureMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={
                SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS
            }
            loadingStates={loadingStates}
            getRowKey={(row) => row.entity}
            DownloadButton={
                <DownloadShoppingAssistantPerformanceByEngagementFeatureButton />
            }
            nameColumns={[
                {
                    accessor: 'entity',
                    label: 'Engagement feature',
                    displayNames: MAP_ENGAGEMENT_TYPE_NAME,
                },
            ]}
        />
    )
}
