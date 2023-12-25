import React from 'react'

import {Redirect} from 'react-router-dom'
import useAppSelector from 'hooks/useAppSelector'

import {getStatsStoreIntegrations} from 'state/stats/selectors'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import StatsPage from 'pages/stats/StatsPage'

import ConvertLimitBanner from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/components/ConvertLimitBanner/ConvertLimitBanner'
import {CampaignStatsFilters} from '../../providers/CampaignStatsFilters'

import {RevenueFilters} from '../../containers/RevenueFilters'
import {RevenueStatsContent} from '../../containers/RevenueStatsContent'

const CampaignsStats = () => {
    return (
        <CampaignStatsFilters>
            <StatsPage title="Campaigns" filters={<RevenueFilters />}>
                <ConvertLimitBanner classes={'mt-4 ml-4 mr-4'} />
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
        <Redirect to="/app/stats/convert/campaigns/subscribe" />
    )
}

export default CampaignStatsOrPaywallPage
