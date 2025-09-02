import { FeatureFlagKey } from '@repo/feature-flags'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useFlag } from 'core/flags'
import { AutomateOverview } from 'domains/reporting/pages/automate/overview/AutomateOverview'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentWelcomePageView } from 'pages/aiAgent/components/AIAgentWelcomePageView/AIAgentWelcomePageView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

const AutomateStatsPaywall: React.FC = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    const isAiAgentExpandingTrialExperienceForAllEnabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
    )

    const storeIntegrations = useStoreIntegrations([IntegrationType.Shopify])
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    return (
        <ErrorBoundary
            sentryTags={{
                section: 'automate-stats',
                team: SentryTeam.CRM_REPORTING,
            }}
        >
            {!hasAutomate ? (
                !isAiAgentExpandingTrialExperienceForAllEnabled ||
                !storeIntegrations.length ? (
                    <AiAgentPaywallView
                        aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
                    />
                ) : (
                    <AIAgentWelcomePageView
                        accountDomain={accountDomain}
                        shopType={storeIntegrations[0].type}
                        shopName={storeIntegrations[0].name}
                    />
                )
            ) : (
                <AutomateOverview />
            )}
        </ErrorBoundary>
    )
}

export default AutomateStatsPaywall
