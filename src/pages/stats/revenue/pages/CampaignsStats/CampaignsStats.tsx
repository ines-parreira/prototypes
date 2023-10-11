import React from 'react'

import {Redirect} from 'react-router-dom'
import useAppSelector from 'hooks/useAppSelector'

import {getStatsStoreIntegrations} from 'state/stats/selectors'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import StatsPage from 'pages/stats/StatsPage'

import {CampaignStatsFilters} from '../../providers/CampaignStatsFilters'

import {RevenueFilters} from '../../containers/RevenueFilters'
import {RevenueStatsContent} from '../../containers/RevenueStatsContent'

const CampaignsStats = () => {
    return (
        <CampaignStatsFilters>
            <StatsPage title="Campaigns" filters={<RevenueFilters />}>
                <RevenueStatsContent />
            </StatsPage>
        </CampaignStatsFilters>
    )
}

function CampaignStatsOrPaywallPage() {
    const isConvertSubscriber = useIsConvertSubscriber()
    const storeIntegrations = useAppSelector(getStatsStoreIntegrations)

    return storeIntegrations.length && isConvertSubscriber ? (
        <CampaignsStats />
    ) : (
        <Redirect to="/app/stats/revenue/campaigns/subscribe" />
    )
}

export default CampaignStatsOrPaywallPage
