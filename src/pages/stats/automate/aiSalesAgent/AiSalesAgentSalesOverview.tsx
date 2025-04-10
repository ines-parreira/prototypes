import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AiSalesAgentChart } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import AiSalesAgentOverviewDownloadButton from 'pages/stats/automate/aiSalesAgent/AiSalesAgentOverviewDownloadButton'
import { AiSalesAgentReportConfig } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentReportConfig'
import { RenderChart } from 'pages/stats/automate/aiSalesAgent/components/RenderChart'
import {
    MIN_DATE_FOR_SALES_AGENT_STATS,
    PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW,
} from 'pages/stats/automate/aiSalesAgent/constants'
import { AnalyticsFooter } from 'pages/stats/common/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import StatsPage from 'pages/stats/common/layout/StatsPage'
import { useFirstStoreWithAiSalesData } from 'pages/stats/convert/hooks/useFirstStoreWithAiSalesData'
import { CampaignStatsFilters } from 'pages/stats/convert/providers/CampaignStatsFilters'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'

const AiSalesAgentSalesOverview = () => {
    useCleanStatsFilters()
    const getGridCellSize = useGridSize()
    const isDiscountSectionVisible: boolean | undefined =
        useFlags()[FeatureFlagKey.StandaloneAiSalesDiscountSection]

    const { isLoading } = useFirstStoreWithAiSalesData({ enabled: true })

    if (isLoading) {
        return (
            <StatsPage title={PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW}>
                <DashboardSection>
                    <DashboardGridCell size={12}>
                        <div className="grid grid-cols-4 gap-4">
                            <Skeleton height={70} />
                        </div>
                    </DashboardGridCell>
                </DashboardSection>

                <DashboardSection title="Main metrics">
                    <DashboardGridCell size={12}>
                        <div className="grid grid-cols-4 gap-4">
                            <Skeleton height={100} />
                        </div>
                    </DashboardGridCell>
                </DashboardSection>

                <DashboardSection title="Order data">
                    <DashboardGridCell size={12}>
                        <Skeleton height={300} />
                    </DashboardGridCell>
                </DashboardSection>
            </StatsPage>
        )
    }

    return (
        <StatsPage
            title={PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW}
            titleExtra={<AiSalesAgentOverviewDownloadButton />}
        >
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)} className="pb-0">
                    <CampaignStatsFilters isSelectStoreWithData>
                        <FiltersPanelWrapper
                            persistentFilters={
                                AiSalesAgentReportConfig.reportFilters
                                    .persistent
                            }
                            optionalFilters={
                                AiSalesAgentReportConfig.reportFilters.optional
                            }
                            filterSettingsOverrides={{
                                [FilterKey.Period]: {
                                    initialSettings: {
                                        minDate: moment(
                                            MIN_DATE_FOR_SALES_AGENT_STATS,
                                            'YYYY-MM-DD',
                                        ).toDate(),
                                        maxSpan: 365,
                                    },
                                },
                            }}
                        />
                    </CampaignStatsFilters>
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title="Main metrics">
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
            <DashboardSection title="Order data">
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
            <DashboardSection title="AI Agent Sales performance">
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
            {isDiscountSectionVisible && (
                <DashboardSection title="Discount code">
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <RenderChart
                            chart={AiSalesAgentChart.AiSalesDiscountOffered}
                            config={AiSalesAgentReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <RenderChart
                            chart={AiSalesAgentChart.AiSalesDiscountApplied}
                            config={AiSalesAgentReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <RenderChart
                            chart={AiSalesAgentChart.AiSalesDiscountRateApplied}
                            config={AiSalesAgentReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <RenderChart
                            chart={AiSalesAgentChart.AiSalesAverageDiscount}
                            config={AiSalesAgentReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
            )}
            <DashboardSection title="Product recommendations performance">
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
            <DashboardSection>
                <DashboardGridCell size={12}>
                    <DashboardComponent
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
