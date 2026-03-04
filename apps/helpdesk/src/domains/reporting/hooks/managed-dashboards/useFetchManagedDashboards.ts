import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useListAnalyticsManagedDashboards } from '@gorgias/helpdesk-queries'

export function useFetchManagedDashboards() {
    const isFeatureFlagEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )
    return useListAnalyticsManagedDashboards(undefined, {
        query: { enabled: !!isFeatureFlagEnabled },
    })
}
