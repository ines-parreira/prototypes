import { useListAnalyticsManagedDashboards } from '@gorgias/helpdesk-queries'

export function useFetchManagedDashboards({
    enabled = true,
}: { enabled?: boolean } = {}) {
    return useListAnalyticsManagedDashboards(undefined, {
        query: { enabled },
    })
}
