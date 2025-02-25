import React from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import {
    paywallConfigs as defaultPaywallConfigs,
    PaywallConfig,
} from 'config/paywalls'
import useEffectOnce from 'hooks/useEffectOnce'
import withStoreIntegration from 'pages/automate/common/utils/withStoreIntegrations'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import AutomateOverviewContent from 'pages/stats/automate/overview/AutomateOverviewContent'
import {
    PAGE_TITLE_AUTOMATE_PAYWALL,
    PAGE_TITLE_OVERVIEW,
} from 'pages/stats/self-service/constants'
import SelfServiceStatsPagePaywallCustomCta from 'pages/stats/self-service/SelfServiceStatsPagePaywallCustomCta'
import { AccountFeature } from 'state/currentAccount/types'

export const AAO_TIPS_VISIBILITY_KEY = 'gorgias-aao-stats-tips-visibility'

export function AutomateOverview() {
    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomateOverviewPageViewed)
    })

    return <AutomateOverviewContent />
}

export default withFeaturePaywall(
    AccountFeature.AutomationSelfServiceStatistics,
    undefined,
    {
        [AccountFeature.AutomationSelfServiceStatistics]: {
            ...defaultPaywallConfigs[AccountFeature.AutomationAddonOverview],
            pageHeader: (
                <PageHeader
                    title={<HeaderTitle title={PAGE_TITLE_AUTOMATE_PAYWALL} />}
                />
            ),
            customCta: <SelfServiceStatsPagePaywallCustomCta />,
        } as PaywallConfig,
    },
)(withStoreIntegration(PAGE_TITLE_OVERVIEW, AutomateOverview))
