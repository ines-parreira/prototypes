import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { IntentPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/IntentPerformanceBreakdownTable'
import { SupportAgentsPerformanceByIntentTable } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/SupportAgentsPerformanceByIntentTable'

export const SupportAgentIntentPerformanceBreakdownTableWrapper = () => {
    const { value: isNewTableEnabled, isLoading } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )

    if (!isLoading && isNewTableEnabled) {
        return <SupportAgentsPerformanceByIntentTable />
    }

    return <IntentPerformanceBreakdownTable />
}
