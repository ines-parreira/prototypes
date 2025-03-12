import React from 'react'

import { useCleanStatsFiltersWithLogicalOperators } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AiSalesAgentChart } from 'pages/stats/aiSalesAgent/AiSalesAgentMetricsConfig'
import AiSalesAgentOverviewDownloadButton from 'pages/stats/aiSalesAgent/AiSalesAgentOverviewDownloadButton'
import { AiSalesAgentReportConfig } from 'pages/stats/aiSalesAgent/AiSalesAgentReportConfig'
import { RenderChart } from 'pages/stats/aiSalesAgent/components/RenderChart'
import { PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW } from 'pages/stats/aiSalesAgent/constants'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import { CampaignStatsFilters } from 'pages/stats/convert/providers/CampaignStatsFilters'
import { CustomReportComponent } from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import { getPageStatsFiltersWithLogicalOperators } from 'state/stats/selectors'

const AiSalesAgentSalesOverview = () => {
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)
    useCleanStatsFiltersWithLogicalOperators(statsFilters)
    const getGridCellSize = useGridSize()

    return (
        <StatsPage
            title={PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW}
            titleExtra={<AiSalesAgentOverviewDownloadButton />}
        >
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)} className="pb-0">
                    <CampaignStatsFilters>
                        <FiltersPanelWrapper
                            persistentFilters={
                                AiSalesAgentReportConfig.reportFilters
                                    .persistent
                            }
                            filterSettingsOverrides={{
                                [FilterKey.Period]: {
                                    initialSettings: {
                                        maxSpan: 365,
                                    },
                                },
                            }}
                        />
                    </CampaignStatsFilters>
                </DashboardGridCell>
            </DashboardSection>

            <DashboardSection title="Main Metrics">
                <DashboardGridCell size={getGridCellSize(3)}>
                    <RenderChart
                        chart={AiSalesAgentChart.AiSalesAgentTotalSalesConv}
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(3)}>
                    <RenderChart
                        chart={AiSalesAgentChart.AiSalesAgentGmv}
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(3)}>
                    <RenderChart
                        chart={AiSalesAgentChart.AiSalesAgentGmvInfluenced}
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(3)}>
                    <RenderChart
                        chart={AiSalesAgentChart.AiSalesAgentRoiRate}
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>

            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)}>
                    <RenderChart
                        chart={
                            AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime
                        }
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>

            <DashboardSection title="Order Data">
                <DashboardGridCell size={getGridCellSize(6)}>
                    <RenderChart
                        chart={
                            AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
                        }
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <RenderChart
                        chart={AiSalesAgentChart.AiSalesAgentAverageOrderValue}
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>

            <DashboardSection title="AI Agent Performance">
                <DashboardGridCell size={getGridCellSize(4)}>
                    <RenderChart
                        chart={AiSalesAgentChart.AiSalesAgentSuccessRate}
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(4)}>
                    <RenderChart
                        chart={AiSalesAgentChart.AiSalesAgentConversionRate}
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(4)}>
                    <RenderChart
                        chart={AiSalesAgentChart.AiSalesTimeSavedByAgent}
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>

            <DashboardSection title="Product Recommendations Performance">
                <DashboardGridCell size={getGridCellSize(4)}>
                    <RenderChart
                        chart={
                            AiSalesAgentChart.AiSalesAgentTotalProductRecommendations
                        }
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(4)}>
                    <RenderChart
                        chart={AiSalesAgentChart.AiSalesAgentProductClickRate}
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(4)}>
                    <RenderChart
                        chart={AiSalesAgentChart.AiSalesAgentProductBuyRate}
                        config={AiSalesAgentReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>

            <DashboardSection title="">
                <DashboardGridCell size={12}>
                    <CustomReportComponent
                        config={AiSalesAgentReportConfig}
                        chart={AiSalesAgentChart.AiSalesAgentProductsTable}
                    />
                </DashboardGridCell>
            </DashboardSection>

            <AnalyticsFooter />
        </StatsPage>
    )
}

export default AiSalesAgentSalesOverview
