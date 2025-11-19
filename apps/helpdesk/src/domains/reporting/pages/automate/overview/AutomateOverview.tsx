import { FeatureFlagKey } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'

import type { PaywallConfig } from 'config/paywalls'
import { paywallConfigs as defaultPaywallConfigs } from 'config/paywalls'
import { useAreFlagsLoading, useFlag } from 'core/flags'
import AutomateOverviewContent from 'domains/reporting/pages/automate/overview/AutomateOverviewContent'
import {
    PAGE_TITLE_AUTOMATE_PAYWALL,
    PAGE_TITLE_OVERVIEW,
} from 'domains/reporting/pages/self-service/constants'
import SelfServiceStatsPagePaywallCustomCta from 'domains/reporting/pages/self-service/SelfServiceStatsPagePaywallCustomCta'
import { AnalyticsOverviewLayout } from 'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewLayout/AnalyticsOverviewLayout'
import withStoreIntegration from 'pages/automate/common/utils/withStoreIntegrations'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import { AccountFeature } from 'state/currentAccount/types'

export const AAO_TIPS_VISIBILITY_KEY = 'gorgias-aao-stats-tips-visibility'

export function AutomateOverview() {
    const areFlagsLoading = useAreFlagsLoading()
    const isAnalyticsDashboardsNewScreensEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens,
    )

    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomateOverviewPageViewed)
        logEvent(SegmentEvent.StatAutomateOverviewPageViewed)
    })

    if (areFlagsLoading) {
        return null
    }

    if (isAnalyticsDashboardsNewScreensEnabled) {
        return <AnalyticsOverviewLayout />
    }

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
