import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { getPreviousUrl } from '@repo/routing'

import type { PaywallConfig } from 'config/paywalls'
import AutomateOverviewContent from 'domains/reporting/pages/automate/overview/AutomateOverviewContent'
import {
    GORGIAS_AUTOMATE_BADGE,
    PAGE_TITLE_AUTOMATE_PAYWALL,
    PAGE_TITLE_OVERVIEW,
} from 'domains/reporting/pages/self-service/constants'
import SelfServiceStatsPagePaywallCustomCta from 'domains/reporting/pages/self-service/SelfServiceStatsPagePaywallCustomCta'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import withStoreIntegration from 'pages/automate/common/utils/withStoreIntegrations'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import {
    PaywallTheme,
    UpgradeType,
} from 'pages/common/components/Paywall/Paywall'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import { STATS_ROUTES } from 'routes/constants'
import { AccountFeature } from 'state/currentAccount/types'
import { assetsUrl } from 'utils'

export const AAO_TIPS_VISIBILITY_KEY = 'gorgias-aao-stats-tips-visibility'

export function AutomateOverview() {
    const { onAnalyticsReportViewed } = useAiAgentAnalyticsDashboardTracking()

    useEffectOnce(() => {
        const previousUrl = getPreviousUrl()
        const previousReport = previousUrl?.split('/app/')[1] ?? '-'

        onAnalyticsReportViewed({
            reportName: STATS_ROUTES.AI_AGENT_OVERVIEW,
            previousReport,
        })
        logEvent(SegmentEvent.AutomateOverviewPageViewed)
        logEvent(SegmentEvent.StatAutomateOverviewPageViewed)
    })

    return <AutomateOverviewContent />
}

export default withFeaturePaywall(
    AccountFeature.AutomationSelfServiceStatistics,
    undefined,
    {
        [AccountFeature.AutomationSelfServiceStatistics]: {
            paywallTheme: PaywallTheme.Default,
            header: PAGE_TITLE_AUTOMATE_PAYWALL,
            description: (
                <div>
                    With Gorgias AI Agent, you can track your automation
                    performance and leverage insights to improve.
                </div>
            ),
            preview: assetsUrl('/img/paywalls/screens/automate-overview.png'),
            requiredUpgrade: GORGIAS_AUTOMATE_BADGE,
            upgradeType: UpgradeType.None,
            pageHeader: (
                <PageHeader
                    title={<HeaderTitle title={PAGE_TITLE_AUTOMATE_PAYWALL} />}
                />
            ),
            customCta: <SelfServiceStatsPagePaywallCustomCta />,
        } as PaywallConfig,
    },
)(withStoreIntegration(PAGE_TITLE_OVERVIEW, AutomateOverview))
