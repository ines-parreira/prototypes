import React, {useMemo} from 'react'

import {Redirect, useParams} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {isEmpty} from 'lodash'
import useAppSelector from 'hooks/useAppSelector'

import {getStatsStoreIntegrations} from 'state/stats/selectors'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import StatsPage from 'pages/stats/StatsPage'

import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import ConvertLimitBanner from 'pages/convert/campaigns/components/ConvertLimitBanner/ConvertLimitBanner'
import {useIsConvertABTestEnabled} from 'pages/convert/common/hooks/useIsConvertABTestEnabled'
import RequestABTest from 'pages/stats/convert/components/RequestABTest'

import {CampaignStatsFilters} from '../../providers/CampaignStatsFilters'

import {RevenueFilters} from '../../containers/RevenueFilters'
import {RevenueStatsContent} from '../../containers/RevenueStatsContent'

type CampaignsStatsProps = {
    isConvertSubscriber: boolean
}

const CampaignsStats = ({isConvertSubscriber}: CampaignsStatsProps) => {
    const {[CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId} =
        useParams<ConvertRouteParams>()
    const isConvertABTestEnabled = useIsConvertABTestEnabled()

    const showButton =
        isConvertABTestEnabled && isConvertSubscriber && chatIntegrationId

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
        <CampaignsStats isConvertSubscriber={isConvertSubscriber} />
    ) : (
        <Redirect to={redirectUrl} />
    )
}

export default CampaignStatsOrPaywallPage
