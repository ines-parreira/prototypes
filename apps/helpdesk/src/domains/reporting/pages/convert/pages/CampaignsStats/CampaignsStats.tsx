import { useMemo } from 'react'

import { useGridSize } from '@repo/hooks'
import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { isEmpty } from 'lodash'
import { Redirect, useParams } from 'react-router-dom'

import { FilterKey } from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { CampaignsLegacyReportConfig } from 'domains/reporting/pages/convert/campaigns/CampaignsLegacyReportConfig'
import { CAMPAIGNS_REPORT_TITLE } from 'domains/reporting/pages/convert/campaigns/CampaignsPerformanceReportConfig'
import DownloadOverviewData from 'domains/reporting/pages/convert/components/DownloadOverviewData'
import RequestABTest from 'domains/reporting/pages/convert/components/RequestABTest'
import { RevenueStatsContent } from 'domains/reporting/pages/convert/containers/RevenueStatsContent'
import { useShopifyIntegrations } from 'domains/reporting/pages/convert/hooks/useShopifyIntegrations'
import css from 'domains/reporting/pages/convert/pages/CampaignsStats/CampaignsStats.less'
import { CampaignStatsFilters } from 'domains/reporting/pages/convert/providers/CampaignStatsFilters'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import ConvertLimitBanner from 'pages/convert/campaigns/components/ConvertLimitBanner/ConvertLimitBanner'
import { CONVERT_ROUTE_PARAM_NAME } from 'pages/convert/common/constants'
import { useIsConvertPerformanceViewEnabled } from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'
import { ConvertRouteParams } from 'pages/convert/common/types'

type CampaignsStatsProps = {
    isConvertSubscriber: boolean
}

const CAMPAIGN_PERFORMANCE_REPORT_TITLE = 'Performance'

const CampaignsStats = ({ isConvertSubscriber }: CampaignsStatsProps) => {
    const { [CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId } =
        useParams<ConvertRouteParams>()

    const showButton = isConvertSubscriber && chatIntegrationId
    const getGridCellSize = useGridSize()
    const isConvertPerformanceViewEnabled = useIsConvertPerformanceViewEnabled()

    return (
        <CampaignStatsFilters>
            <StatsPage
                title={
                    chatIntegrationId
                        ? CAMPAIGN_PERFORMANCE_REPORT_TITLE
                        : CAMPAIGNS_REPORT_TITLE
                }
                titleExtra={
                    <>
                        {showButton ? <RequestABTest /> : null}
                        {isConvertPerformanceViewEnabled && (
                            <DownloadOverviewData />
                        )}
                    </>
                }
            >
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanelWrapper
                            filterSettingsOverrides={{
                                [FilterKey.Period]: {
                                    initialSettings: {
                                        maxSpan: 90,
                                    },
                                },
                            }}
                            persistentFilters={
                                CampaignsLegacyReportConfig.reportFilters
                                    .persistent
                            }
                            optionalFilters={
                                CampaignsLegacyReportConfig.reportFilters
                                    .optional
                            }
                            withSavedFilters={false}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <ConvertLimitBanner classes={'mt-4 ml-4 mr-4'} />
                <RevenueStatsContent />
            </StatsPage>
        </CampaignStatsFilters>
    )
}

function CampaignStatsOrPaywallPage() {
    const { [CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId } =
        useParams<ConvertRouteParams>()

    const isConvertSubscriber = useIsConvertSubscriber()
    const shopifyStoreIntegrations = useShopifyIntegrations()
    const flags = useFlags()

    const redirectUrl = useMemo(() => {
        if (chatIntegrationId) {
            return `/app/convert/${chatIntegrationId}/performance/subscribe`
        }
        return '/app/stats/convert/campaigns/subscribe'
    }, [chatIntegrationId])

    // Wait for flags to be loaded before rendering the page
    if (isEmpty(flags)) {
        return null
    }

    if (!isConvertSubscriber) {
        return <Redirect to={redirectUrl} />
    }

    if (shopifyStoreIntegrations.length === 0) {
        return (
            <div className={classNames('full-width', css.wrapper)}>
                <Alert type={AlertType.Error} icon>
                    Campaigns dashboard is only available for Shopify stores.
                </Alert>
            </div>
        )
    }

    return <CampaignsStats isConvertSubscriber={isConvertSubscriber} />
}

export default CampaignStatsOrPaywallPage
