import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS,
    SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/columns'
import {
    DownloadShoppingAssistantPerformanceByEngagementFeatureButton,
    useDownloadShoppingAssistantPerformanceByEngagementFeatureAction,
} from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/DownloadShoppingAssistantPerformanceByEngagementFeatureButton'
import { useShoppingAssistantPerformanceByEngagementFeatureMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantPerformanceByEngagementFeatureMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartConfig?: { label: string }
    customDashboardChartSchema?: DashboardChartSchema
}

export const ShoppingAssistantPerformanceByEngagementFeatureTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: Props) => {
    const { data = [], loadingStates } =
        useShoppingAssistantPerformanceByEngagementFeatureMetrics()
    const exportCsvAction =
        useDownloadShoppingAssistantPerformanceByEngagementFeatureAction()
    const { onSaveColumns } = useCustomDashboardTableColumns({
        customDashboardChartSchema,
        dashboard,
    })
    const withMenu = withChartMenu && chartId

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={
                SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS
            }
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? (
                    <DownloadShoppingAssistantPerformanceByEngagementFeatureButton />
                ) : undefined
            }
            nameColumns={
                SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_NAME_COLUMNS
            }
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Engagement feature"
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            name={chartConfig?.label}
            customDashboardChartSchema={customDashboardChartSchema}
            onSaveColumns={onSaveColumns}
        />
    )
}
