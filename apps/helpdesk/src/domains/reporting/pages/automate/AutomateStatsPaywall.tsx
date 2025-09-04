import { SentryTeam } from 'common/const/sentryTeamNames'
import { AutomateOverview } from 'domains/reporting/pages/automate/overview/AutomateOverview'
import useAppSelector from 'hooks/useAppSelector'
import { TrialPaywallMiddleware } from 'pages/aiAgent/Overview/middlewares/TrialPaywallMiddleware'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getHasAutomate } from 'state/billing/selectors'

const AutomateStatsPaywall: React.FC = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    return (
        <ErrorBoundary
            sentryTags={{
                section: 'automate-stats',
                team: SentryTeam.CRM_REPORTING,
            }}
        >
            {!hasAutomate ? <TrialPaywallMiddleware /> : <AutomateOverview />}
        </ErrorBoundary>
    )
}

export default AutomateStatsPaywall
