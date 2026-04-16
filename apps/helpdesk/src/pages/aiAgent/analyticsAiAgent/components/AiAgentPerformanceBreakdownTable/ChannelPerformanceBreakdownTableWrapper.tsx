import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box, Skeleton } from '@gorgias/axiom'

import { ChannelPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ChannelPerformanceBreakdownTable'
import { AllAgentsPerformanceByChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/AllAgentsPerformanceByChannelTable'

export const ChannelPerformanceBreakdownTableWrapper = () => {
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
        return <AllAgentsPerformanceByChannelTable />
    }

    return <ChannelPerformanceBreakdownTable />
}
