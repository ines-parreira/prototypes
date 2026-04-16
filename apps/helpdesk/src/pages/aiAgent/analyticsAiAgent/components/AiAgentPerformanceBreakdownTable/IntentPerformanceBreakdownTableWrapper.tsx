import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box, Skeleton } from '@gorgias/axiom'

import { IntentPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/IntentPerformanceBreakdownTable'
import { AllAgentsPerformanceByIntentTable } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/AllAgentsPerformanceByIntentTable'

export const IntentPerformanceBreakdownTableWrapper = () => {
    const { value: isNewTableEnabled, isLoading } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )

    if (isLoading) {
        return (
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                width="100%"
                padding="xl"
            >
                <Skeleton width={200} height={200} />
            </Box>
        )
    }

    if (isNewTableEnabled) {
        return <AllAgentsPerformanceByIntentTable />
    }

    return <IntentPerformanceBreakdownTable />
}
