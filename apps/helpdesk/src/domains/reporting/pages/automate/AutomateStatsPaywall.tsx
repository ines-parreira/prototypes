import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import css from 'domains/reporting/pages/automate/AutomateStatsPaywall.less'
import { AutomateOverview } from 'domains/reporting/pages/automate/overview/AutomateOverview'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { TrialPaywallMiddleware } from 'pages/aiAgent/Overview/middlewares/TrialPaywallMiddleware'
import { ErrorBoundary } from 'pages/ErrorBoundary'

const AutomateStatsPaywall: React.FC = () => {
    const { hasAccess, isLoading } = useAiAgentAccess()

    if (isLoading) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <ErrorBoundary
            sentryTags={{
                section: 'automate-stats',
                team: SentryTeam.CPLT_ANALYTICS_FRONTEND,
            }}
        >
            {hasAccess ? <AutomateOverview /> : <TrialPaywallMiddleware />}
        </ErrorBoundary>
    )
}

export { AutomateStatsPaywall }
