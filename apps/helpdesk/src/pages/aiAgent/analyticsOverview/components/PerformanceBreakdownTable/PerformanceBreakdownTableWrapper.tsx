import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box, Skeleton } from '@gorgias/axiom'

import { PerformanceBreakdownTable } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTable'
import { PerformanceBreakdownTableV2 } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTableV2'

export const PerformanceBreakdownTableWrapper = () => {
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
        return <PerformanceBreakdownTableV2 />
    }

    return <PerformanceBreakdownTable />
}
