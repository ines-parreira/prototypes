import { useEffect, useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'
import { useParams } from 'react-router-dom'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey, StaticFilter } from 'models/stat/types'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'
import { AiSalesAgentChart } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { RenderChart } from 'pages/stats/automate/aiSalesAgent/components/RenderChart'
import { MIN_DATE_FOR_SALES_AGENT_STATS } from 'pages/stats/automate/aiSalesAgent/constants'
import { AnalyticsFooter } from 'pages/stats/common/AnalyticsFooter'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import { useFirstStoreWithAiSalesData } from 'pages/stats/convert/hooks/useFirstStoreWithAiSalesData'
import { CampaignStatsFilters } from 'pages/stats/convert/providers/CampaignStatsFilters'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import { mergeStatsFiltersWithLogicalOperator } from 'state/stats/statsSlice'

import { AiSalesAgentReportConfig } from '../AiSalesAgentReportConfig'

const SalesOverview = () => {
    const getGridCellSize = useGridSize()
    const isDiscountSectionVisible: boolean | undefined =
        useFlags()[FeatureFlagKey.StandaloneAiSalesDiscountSection]
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { isLoading } = useFirstStoreWithAiSalesData({ enabled: true })
    const dispatch = useAppDispatch()
    const storeIntegration = useStoreIntegrationByShopName(shopName)

    const filteredPersistentFilters = useMemo((): StaticFilter[] => {
        if (storeIntegration?.id) {
            return AiSalesAgentReportConfig.reportFilters.persistent.filter(
                (filter) => filter !== FilterKey.StoreIntegrations,
            )
        }
        return AiSalesAgentReportConfig.reportFilters.persistent
    }, [storeIntegration?.id])

    useEffect(() => {
        if (storeIntegration?.id) {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    storeIntegrations: {
                        values: [storeIntegration.id],
                        operator: LogicalOperatorEnum.ONE_OF,
                    },
                }),
            )
        }
    }, [dispatch, storeIntegration?.id, shopName])

    if (isLoading) {
        return (
            <>
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

                <DashboardSection title="Orders">
                    <DashboardGridCell size={12}>
                        <Skeleton height={300} />
                    </DashboardGridCell>
                </DashboardSection>
            </>
        )
    }

    return (
        <>
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)} className="pb-0">
                    <CampaignStatsFilters isSelectStoreWithData>
                        <FiltersPanelWrapper
                            persistentFilters={filteredPersistentFilters}
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
            <DashboardSection title="Orders">
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
            <DashboardSection title="Shopping Assistant performance">
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
                <DashboardSection title="Discounts">
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
            <DashboardSection title="Product recommendations">
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
        </>
    )
}

export default SalesOverview
