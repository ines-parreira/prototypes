import { useEffect, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useGridSize } from '@repo/hooks'
import moment from 'moment'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import {
    LegacyBanner as Banner,
    LegacyButton as Button,
    Skeleton,
} from '@gorgias/axiom'

import { AlertBannerTypes } from 'AlertBanners'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AiSalesAgentChart } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { AiSalesAgentReportConfig } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentReportConfig'
import { RenderChart } from 'domains/reporting/pages/automate/aiSalesAgent/components/RenderChart'
import css from 'domains/reporting/pages/automate/aiSalesAgent/components/SalesOverview.less'
import { WarningBannerProvider } from 'domains/reporting/pages/automate/aiSalesAgent/components/WarningBannerProvider'
import { MIN_DATE_FOR_SALES_AGENT_STATS } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { useWarningBannerIsDisplayed } from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useWarningBannerIsDisplayed'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import { useFirstStoreWithAiSalesData } from 'domains/reporting/pages/convert/hooks/useFirstStoreWithAiSalesData'
import { CampaignStatsFilters } from 'domains/reporting/pages/convert/providers/CampaignStatsFilters'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { getStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreIntegrationById } from 'pages/aiAgent/hooks/useStoreIntegrationById'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'

const SalesOverview = () => {
    const history = useHistory()
    const location = useLocation()
    const getGridCellSize = useGridSize()
    const isDiscountSectionVisible = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { isLoading } = useFirstStoreWithAiSalesData({ enabled: true })
    const dispatch = useAppDispatch()
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)
    const storeIntegration = useStoreIntegrationByShopName(shopName)

    const activeStoreIntegrationId = useMemo(
        () => statsFilters.storeIntegrations?.values?.[0] || -1,
        [statsFilters.storeIntegrations?.values],
    )

    const storeIntegrationFromStoreFilter = useStoreIntegrationById(
        activeStoreIntegrationId,
    )

    const {
        isBannerDisplayed,
        redirectToChatSettings,
        isLoading: isBannerLoading,
    } = useWarningBannerIsDisplayed({
        storeName: shopName,
        storeIntegrationFromStoreFilter,
    })

    useEffect(() => {
        const pathnameEndsWithShopName = location.pathname.endsWith(
            `/${shopName}`,
        )

        if (
            shopName &&
            pathnameEndsWithShopName &&
            activeStoreIntegrationId === storeIntegration?.id
        ) {
            const basePath = location.pathname.replace(`/${shopName}`, '')
            history.replace(basePath)
        }
    }, [
        shopName,
        activeStoreIntegrationId,
        storeIntegration?.id,
        history,
        location.pathname,
    ])

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
    }, [dispatch, storeIntegration?.id])

    if (isLoading || isBannerLoading) {
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
        <WarningBannerProvider isBannerVisible={isBannerDisplayed}>
            <>
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <CampaignStatsFilters isSelectStoreWithData>
                            <FiltersPanelWrapper
                                persistentFilters={
                                    AiSalesAgentReportConfig.reportFilters
                                        .persistent
                                }
                                optionalFilters={
                                    AiSalesAgentReportConfig.reportFilters
                                        .optional
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

                {isBannerDisplayed && (
                    <Banner
                        type={AlertBannerTypes.Warning}
                        suffix={
                            <Button
                                fillStyle="ghost"
                                onClick={redirectToChatSettings}
                            >
                                Update Installation
                            </Button>
                        }
                        className={css.banner}
                    >
                        We cannot display Shopping Assistant&apos;s analytics
                        until you update your chat&apos;s manual installation
                        with the tracking bundle
                    </Banner>
                )}

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
                            chart={
                                AiSalesAgentChart.AiSalesAgentAverageOrderValue
                            }
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
                    <DashboardSection title="Discounts generated by Shopping Assistant">
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
                                chart={
                                    AiSalesAgentChart.AiSalesDiscountRateApplied
                                }
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
                            chart={
                                AiSalesAgentChart.AiSalesAgentProductClickRate
                            }
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
        </WarningBannerProvider>
    )
}

export default SalesOverview
