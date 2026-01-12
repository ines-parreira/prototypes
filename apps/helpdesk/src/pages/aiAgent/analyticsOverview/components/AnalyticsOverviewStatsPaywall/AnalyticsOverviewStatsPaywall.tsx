import { Box, Skeleton } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { TrialPaywallMiddleware } from 'pages/aiAgent/Overview/middlewares/TrialPaywallMiddleware'
import { ErrorBoundary } from 'pages/ErrorBoundary'

import { AnalyticsOverviewLayout } from '../AnalyticsOverviewLayout/AnalyticsOverviewLayout'

export const AnalyticsOverviewStatsPaywall: React.FC = () => {
    const { hasAccess, isLoading } = useAiAgentAccess()

    if (isLoading) {
        return (
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                width="100%"
                height="100%"
                padding="xl"
            >
                <Skeleton width={200} height={200} />
            </Box>
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
                <AnalyticsOverviewLayout />
            ) : (
                <TrialPaywallMiddleware />
            )}
        </ErrorBoundary>
    )
}
