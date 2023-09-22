import React from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {AccountFeature} from 'state/currentAccount/types'
import {getStatsStoreIntegrations} from 'state/stats/selectors'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {withFeaturePaywall} from 'pages/common/utils/withFeaturePaywall'

import RevenueStatsRestrictedFeature from 'pages/stats/RevenueStatsRestrictedFeature'
import StatsPage from 'pages/stats/StatsPage'

import {CampaignStatsFilters} from '../../providers/CampaignStatsFilters'

import {RevenueFilters} from '../../containers/RevenueFilters'
import {RevenueStatsContent} from '../../containers/RevenueStatsContent'

const CampaignsStats = () => {
    const isConvertSubscriber = useIsConvertSubscriber()

    return (
        <CampaignStatsFilters>
            <StatsPage title="Campaigns" filters={<RevenueFilters />}>
                {isConvertSubscriber ? (
                    <RevenueStatsContent />
                ) : (
                    <div>
                        You should not be here. Contact your CSM to get access
                        to this page
                    </div>
                )}
            </StatsPage>
        </CampaignStatsFilters>
    )
}

function RevenueOrRestrictedFeaturePage() {
    const storeIntegrations = useAppSelector(getStatsStoreIntegrations)
    return storeIntegrations.length ? (
        <CampaignsStats />
    ) : (
        <RevenueStatsRestrictedFeature />
    )
}

export default withFeaturePaywall(AccountFeature.RevenueStatistics)(
    RevenueOrRestrictedFeaturePage
)
