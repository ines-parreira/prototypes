import { useLocalStorage } from '@repo/hooks'

import { STATS_TIPS_VISIBILITY_KEY } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'

export function useTipsVisibility(defaultValue = true) {
    return useLocalStorage(STATS_TIPS_VISIBILITY_KEY, defaultValue)
}
