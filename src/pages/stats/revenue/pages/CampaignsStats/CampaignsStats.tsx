import React, {useMemo} from 'react'

import {Redirect, useParams} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {isEmpty} from 'lodash'
import useAppSelector from 'hooks/useAppSelector'

import {getStatsStoreIntegrations} from 'state/stats/selectors'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import StatsPage from 'pages/stats/StatsPage'

import ConvertLimitBanner from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/components/ConvertLimitBanner/ConvertLimitBanner'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {CampaignStatsFilters} from '../../providers/CampaignStatsFilters'

import {RevenueFilters} from '../../containers/RevenueFilters'
import {RevenueStatsContent} from '../../containers/RevenueStatsContent'

const CampaignsStats = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId} =
        useParams<ConvertRouteParams>()
    return (
        <CampaignStatsFilters>
            <StatsPage
                title={chatIntegrationId ? 'Performance' : 'Campaigns'}
                filters={<RevenueFilters />}
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
    const storeIntegrations = useAppSelector(getStatsStoreIntegrations)
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

    return storeIntegrations.length && isConvertSubscriber ? (
        <CampaignsStats />
    ) : (
        <Redirect to={redirectUrl} />
    )
}

export default CampaignStatsOrPaywallPage
