import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useCreateAnalyticsManagedDashboard,
} from '@gorgias/helpdesk-queries'

import { isGorgiasApiError } from 'models/api/types'

export const MANAGED_DASHBOARD_SAVED_MESSAGE =
    'Dashboard settings saved successfully'
export const MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE =
    'Failed to save dashboard settings'

type UseCreateManagedDashboardOptions = {
    silent?: boolean
}

export const managedDashboardKeys = queryKeys.analyticsManagedDashboards

export function useCreateManagedDashboard(
    options?: UseCreateManagedDashboardOptions,
) {
    const { silent = false } = options ?? {}
    const queryClient = useQueryClient()

    return useCreateAnalyticsManagedDashboard({
        mutation: {
            onSuccess: () => {
                void queryClient.invalidateQueries(
                    managedDashboardKeys.listAnalyticsManagedDashboards(),
                )
                if (!silent) {
                    toast.success(MANAGED_DASHBOARD_SAVED_MESSAGE)
                }
            },
            onError: (error) => {
                const errorMessage = isGorgiasApiError(error)
                    ? error.response.data.error.msg
                    : MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE

                toast.error(errorMessage)
            },
        },
    })
}
