import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { SupportAgentChannelPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/SupportAgentChannelPerformanceBreakdownTable'
import { SupportAgentsPerformanceByChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/SupportAgentsPerformanceByChannelTable'

export const SupportAgentChannelPerformanceBreakdownTableWrapper = () => {
    const { value: isNewTableEnabled, isLoading } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )

    if (!isLoading && isNewTableEnabled) {
        return <SupportAgentsPerformanceByChannelTable />
    }

    return <SupportAgentChannelPerformanceBreakdownTable />
}
