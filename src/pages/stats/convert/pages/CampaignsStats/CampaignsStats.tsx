import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {isEmpty} from 'lodash'
import React, {useMemo} from 'react'
import {Redirect, useParams} from 'react-router-dom'
import {FeatureFlagKey} from 'config/featureFlags'
import {useGridSize} from 'hooks/useGridSize'
import {FilterComponentKey, FilterKey} from 'models/stat/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import ConvertLimitBanner from 'pages/convert/campaigns/components/ConvertLimitBanner/ConvertLimitBanner'

import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {useIsConvertPerformanceViewEnabled} from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import DownloadOverviewData from 'pages/stats/convert/components/DownloadOverviewData'
import RequestABTest from 'pages/stats/convert/components/RequestABTest'
import {RevenueFilters} from 'pages/stats/convert/containers/RevenueFilters'
import {RevenueStatsContent} from 'pages/stats/convert/containers/RevenueStatsContent'

import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'
import {CampaignStatsFilters} from 'pages/stats/convert/providers/CampaignStatsFilters'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'

import StatsPage from 'pages/stats/StatsPage'

import css from './CampaignsStats.less'

type CampaignsStatsProps = {
    isConvertSubscriber: boolean
}

const CampaignsStats = ({isConvertSubscriber}: CampaignsStatsProps) => {
    const AnalyticsNewFiltersConvert =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFiltersConvert]
    const {[CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId} =
        useParams<ConvertRouteParams>()

    const showButton = isConvertSubscriber && chatIntegrationId
    const getGridCellSize = useGridSize()
    const isConvertPerformanceViewEnabled = useIsConvertPerformanceViewEnabled()

    return (
        <CampaignStatsFilters>
            <StatsPage
                title={chatIntegrationId ? 'Performance' : 'Campaigns'}
                titleExtra={
                    <>
                        {showButton ? <RequestABTest /> : null}
                        {!AnalyticsNewFiltersConvert && <RevenueFilters />}
                        {isConvertPerformanceViewEnabled && (
                            <DownloadOverviewData />
                        )}
                    </>
                }
            >
                {AnalyticsNewFiltersConvert && (
                    <DashboardSection>
                        <DashboardGridCell
                            size={getGridCellSize(12)}
                            className="pb-0"
                        >
                            <FiltersPanel
                                filterSettingsOverrides={{
                                    [FilterKey.Period]: {
                                        initialSettings: {
                                            maxSpan: 90,
                                        },
                                    },
                                }}
                                persistentFilters={[
                                    FilterKey.Period,
                                    FilterKey.AggregationWindow,
                                    FilterComponentKey.Store,
                                ]}
                                optionalFilters={[
                                    FilterKey.Campaigns,
                                    FilterKey.CampaignStatuses,
                                ]}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                )}
                <ConvertLimitBanner classes={'mt-4 ml-4 mr-4'} />
                <RevenueStatsContent />
            </StatsPage>
        </CampaignStatsFilters>
    )
}

function CampaignStatsOrPaywallPage() {
    const {[CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId} =
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
