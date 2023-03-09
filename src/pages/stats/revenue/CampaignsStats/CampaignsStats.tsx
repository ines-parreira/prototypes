import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import useAppSelector from 'hooks/useAppSelector'

import {AccountFeature} from 'state/currentAccount/types'
import {getStatsStoreIntegrations} from 'state/stats/selectors'

import {useIsRevenueBetaTester} from 'pages/common/hooks/useIsRevenueBetaTester'
import {withFeaturePaywall} from 'pages/common/utils/withFeaturePaywall'

import RevenueStatsRestrictedFeature from 'pages/stats/RevenueStatsRestrictedFeature'
import StatsPage from 'pages/stats/StatsPage'

const CampaignsStats = () => {
    const isRevenueSubscriber = useIsRevenueBetaTester()
    const hasAttributionModel = Boolean(
        useFlags()[FeatureFlagKey.RevenueAttributionModel]
    )

    return (
        <StatsPage title="Campaigns" filters={null}>
            {isRevenueSubscriber && hasAttributionModel ? (
                <div>Lots of stats here</div>
            ) : (
                <div>
                    You should not be here. Contact your CSM to get access to
                    this page
                </div>
            )}
        </StatsPage>
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
