import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box, Skeleton } from '@gorgias/axiom'

import { SupportAgentChannelPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/SupportAgentChannelPerformanceBreakdownTable'
import { SupportAgentsPerformanceByChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/SupportAgentsPerformanceByChannelTable'

type Props = {
    chartId?: string
}

export const SupportAgentChannelPerformanceBreakdownTableWrapper = ({
    chartId,
}: Props) => {
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
        return <SupportAgentsPerformanceByChannelTable chartId={chartId} />
    }

    return <SupportAgentChannelPerformanceBreakdownTable />
}
