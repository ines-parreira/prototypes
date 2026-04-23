import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box, Skeleton } from '@gorgias/axiom'

import { ShoppingAssistantChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ShoppingAssistantChannelTable'
import { AiAgentSalesPerformanceByChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/AiAgentSalesPerformanceByChannelTable'

type Props = {
    chartId?: string
}

export const ShoppingAssistantChannelTableWrapper = ({ chartId }: Props) => {
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
        return <AiAgentSalesPerformanceByChannelTable chartId={chartId} />
    }

    return <ShoppingAssistantChannelTable />
}
