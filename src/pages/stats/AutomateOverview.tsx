import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from 'config/paywalls'
import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'

import useEffectOnce from 'hooks/useEffectOnce'
import withStoreIntegration from 'pages/automate/common/utils/withStoreIntegrations'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import AutomateOverviewV2 from 'pages/stats/AutomateOverviewV2'
import {
    PAGE_TITLE_AUTOMATE_PAYWALL,
    PAGE_TITLE_OVERVIEW,
} from 'pages/stats/self-service/constants'
import SelfServiceStatsPagePaywallCustomCta from 'pages/stats/self-service/SelfServiceStatsPagePaywallCustomCta'
import {AccountFeature} from 'state/currentAccount/types'

export const AAO_TIPS_VISIBILITY_KEY = 'gorgias-aao-stats-tips-visibility'

export function AutomateOverview() {
    const {statsFilters, userTimezone, granularity} = useNewAutomateFilters()

    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomateOverviewPageViewed)
    })

    return (
        <AutomateOverviewV2
            filters={statsFilters}
            timezone={userTimezone}
            granularity={granularity}
        />
    )
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
    }
)(withStoreIntegration(PAGE_TITLE_OVERVIEW, AutomateOverview))
