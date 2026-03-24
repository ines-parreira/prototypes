import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { ChannelPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ChannelPerformanceBreakdownTable'
import { AllAgentsPerformanceByChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/AllAgentsPerformanceByChannelTable'

export const ChannelPerformanceBreakdownTableWrapper = () => {
    const { value: isNewTableEnabled, isLoading } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )

    if (!isLoading && isNewTableEnabled) {
        return <AllAgentsPerformanceByChannelTable />
    }

    return <ChannelPerformanceBreakdownTable />
}
