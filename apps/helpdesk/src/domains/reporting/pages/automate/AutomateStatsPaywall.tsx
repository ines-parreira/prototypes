import { LoadingSpinner } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { AutomateOverview } from 'domains/reporting/pages/automate/overview/AutomateOverview'
import { useCanUseAiAgent } from 'hooks/aiAgent/useCanUseAiAgent'
import useAppSelector from 'hooks/useAppSelector'
import { TrialPaywallMiddleware } from 'pages/aiAgent/Overview/middlewares/TrialPaywallMiddleware'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getHasAutomate } from 'state/billing/selectors'

import css from './AutomateStatsPaywall.less'

const AutomateStatsPaywall: React.FC = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const { hasAnyActiveTrial, isLoading } = useCanUseAiAgent()
    const canBypassPaywall = hasAutomate || hasAnyActiveTrial

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
            {canBypassPaywall ? (
                <AutomateOverview />
            ) : (
                <TrialPaywallMiddleware />
            )}
        </ErrorBoundary>
    )
}

export default AutomateStatsPaywall
