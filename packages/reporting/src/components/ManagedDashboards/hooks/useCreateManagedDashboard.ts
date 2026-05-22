import { useCreateAnalyticsManagedDashboard } from '@gorgias/helpdesk-queries'

import { useManagedDashboardMutationOptions } from './useManagedDashboardMutationOptions'

type Options = {
    silent?: boolean
}

export function useCreateManagedDashboard(options?: Options) {
    return useCreateAnalyticsManagedDashboard({
        mutation: useManagedDashboardMutationOptions(options),
    })
}
