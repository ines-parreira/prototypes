import { useCallback, useEffect, useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'
import { useHistory, useParams } from 'react-router-dom'

import { Banner, Button, Skeleton } from '@gorgias/merchant-ui-kit'

import { AlertBannerTypes } from 'AlertBanners'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey, StaticFilter } from 'models/stat/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useStoreIntegrationById } from 'pages/aiAgent/hooks/useStoreIntegrationById'
import { useTrackingBundleInstallationWarningCheck } from 'pages/aiAgent/hooks/useTrackingBundleInstallationWarningCheck'
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
import { getCurrentUser } from 'state/currentUser/selectors'
import { getStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'state/stats/statsSlice'
import { isAdmin, isTeamLead } from 'utils'

import { AiSalesAgentReportConfig } from '../AiSalesAgentReportConfig'

import css from './SalesOverview.less'

const SalesOverview = () => {
    const getGridCellSize = useGridSize()
    const isDiscountSectionVisible: boolean | undefined =
        useFlags()[FeatureFlagKey.AiShoppingAssistantEnabled]
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

    const history = useHistory()

    const { storeActivations, isFetchLoading } = useStoreActivations({
        pageName: window.location.pathname,
        storeName: shopName || storeIntegrationFromStoreFilter?.name,
        withChatIntegrationsStatus: true,
        withStoresKnowledgeStatus: true,
    })

    const { uninstalledChatIntegrationId } =
        useTrackingBundleInstallationWarningCheck({ storeActivations })

    const redirectionPath = useMemo(() => {
        if (!uninstalledChatIntegrationId) {
            return ''
        }

        return `/app/settings/channels/gorgias_chat/${uninstalledChatIntegrationId}/installation`
    }, [uninstalledChatIntegrationId])
    const onClick = useCallback(() => {
        history.push(redirectionPath)
    }, [history, redirectionPath])
    const currentUser = useAppSelector(getCurrentUser)
    const displayBanner = useMemo(
        () =>
            !!uninstalledChatIntegrationId &&
            !!redirectionPath &&
            (isAdmin(currentUser) || isTeamLead(currentUser)),
        [currentUser, redirectionPath, uninstalledChatIntegrationId],
    )

    const filteredPersistentFilters = useMemo((): StaticFilter[] => {
        if (shopName) {
            return AiSalesAgentReportConfig.reportFilters.persistent.filter(
                (filter) => filter !== FilterKey.StoreIntegrations,
            )
        }
        return AiSalesAgentReportConfig.reportFilters.persistent
    }, [shopName])

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

    if (isLoading || isFetchLoading) {
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

            {displayBanner && (
                <Banner
                    type={AlertBannerTypes.Warning}
                    suffix={
                        <Button fillStyle="ghost" onClick={onClick}>
                            Update Installation
                        </Button>
                    }
                    className={css.banner}
                >
                    We cannot display Shopping Assistant&apos;s analytics until
                    you update your chat&apos;s manual installation with the
                    tracking bundle
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
