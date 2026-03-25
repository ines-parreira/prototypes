import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { IntentPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/IntentPerformanceBreakdownTable'
import { AllAgentsPerformanceByIntentTable } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/AllAgentsPerformanceByIntentTable'

export const IntentPerformanceBreakdownTableWrapper = () => {
    const { value: isNewTableEnabled, isLoading } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )

    if (!isLoading && isNewTableEnabled) {
        return <AllAgentsPerformanceByIntentTable />
    }

    return <IntentPerformanceBreakdownTable />
}
