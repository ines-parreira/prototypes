import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box, Skeleton } from '@gorgias/axiom'

import { IntentPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/IntentPerformanceBreakdownTable'
import { SupportAgentsPerformanceByIntentTable } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/SupportAgentsPerformanceByIntentTable'

type Props = {
    chartId?: string
}

export const SupportAgentIntentPerformanceBreakdownTableWrapper = ({
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
        return <SupportAgentsPerformanceByIntentTable chartId={chartId} />
    }

    return <IntentPerformanceBreakdownTable />
}
