import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { AutomateOverview } from 'pages/stats/automate/overview/AutomateOverview'
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
            {!hasAutomate ? (
                <AiAgentPaywallView
                    aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
                />
            ) : (
                <AutomateOverview />
            )}
        </ErrorBoundary>
    )
}

export default AutomateStatsPaywall
