import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { ShoppingAssistantChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ShoppingAssistantChannelTable'
import { AiAgentSalesPerformanceByChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/AiAgentSalesPerformanceByChannelTable'

export const ShoppingAssistantChannelTableWrapper = () => {
    const { value: isNewTableEnabled, isLoading } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )

    if (!isLoading && isNewTableEnabled) {
        return <AiAgentSalesPerformanceByChannelTable />
    }

    return <ShoppingAssistantChannelTable />
}
