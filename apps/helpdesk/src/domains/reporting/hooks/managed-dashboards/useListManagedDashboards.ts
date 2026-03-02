import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useListAnalyticsManagedDashboards } from '@gorgias/helpdesk-queries'
import type { AnalyticsManagedDashboard } from '@gorgias/helpdesk-types'

type UseListManagedDashboardsOptions = {
    enabled?: boolean
}

type UseListManagedDashboardsResult = {
    data: AnalyticsManagedDashboard[]
}

export function useListManagedDashboards(
    options?: UseListManagedDashboardsOptions,
): UseListManagedDashboardsResult {
    const isFeatureFlagEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )
    const { data } = useListAnalyticsManagedDashboards(undefined, {
        query: { enabled: isFeatureFlagEnabled && (options?.enabled ?? true) },
    })

    return {
        data: data?.data?.data ?? [],
    }
}
