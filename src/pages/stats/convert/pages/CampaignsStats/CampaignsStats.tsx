import React, {useMemo} from 'react'

import {Redirect, useParams} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {isEmpty} from 'lodash'

import classNames from 'classnames'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import StatsPage from 'pages/stats/StatsPage'

import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import ConvertLimitBanner from 'pages/convert/campaigns/components/ConvertLimitBanner/ConvertLimitBanner'
import RequestABTest from 'pages/stats/convert/components/RequestABTest'

import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {CampaignStatsFilters} from '../../providers/CampaignStatsFilters'

import {RevenueFilters} from '../../containers/RevenueFilters'
import {RevenueStatsContent} from '../../containers/RevenueStatsContent'

import css from './CampaignsStats.less'

type CampaignsStatsProps = {
    isConvertSubscriber: boolean
}

const CampaignsStats = ({isConvertSubscriber}: CampaignsStatsProps) => {
    const {[CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId} =
        useParams<ConvertRouteParams>()
    const showButton = isConvertSubscriber && chatIntegrationId

    return (
        <CampaignStatsFilters>
            <StatsPage
                title={chatIntegrationId ? 'Performance' : 'Campaigns'}
                titleExtra={
                    <>
                        {showButton ? <RequestABTest /> : null}
                        <RevenueFilters />
                    </>
                }
            >
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
