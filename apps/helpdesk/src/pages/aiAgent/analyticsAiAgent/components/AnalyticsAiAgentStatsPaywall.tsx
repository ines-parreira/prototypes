import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { TrialPaywallMiddleware } from 'pages/aiAgent/Overview/middlewares/TrialPaywallMiddleware'
import { ErrorBoundary } from 'pages/ErrorBoundary'

import { AnalyticsAiAgentLayout } from './AnalyticsAiAgentLayout'

import css from './AnalyticsAiAgentStatsPaywall.less'

const AnalyticsAiAgentStatsPaywall: React.FC = () => {
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
                team: SentryTeam.CRM_REPORTING,
            }}
        >
            {hasAccess ? (
                <AnalyticsAiAgentLayout />
            ) : (
                <TrialPaywallMiddleware />
            )}
        </ErrorBoundary>
    )
}

export default AnalyticsAiAgentStatsPaywall
