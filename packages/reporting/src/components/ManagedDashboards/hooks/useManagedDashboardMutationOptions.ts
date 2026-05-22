import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'

import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import {
    MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
    MANAGED_DASHBOARD_SAVED_MESSAGE,
    managedDashboardKeys,
} from './constants'

type Options = {
    silent?: boolean
}

/**
 * Shared `onSuccess` / `onError` handlers used by every managed-dashboard
 * mutation hook (create / update): invalidate the dashboard list cache, then
 * toast success or surface the API error message.
 */
export function useManagedDashboardMutationOptions({
    silent = false,
}: Options = {}) {
    const queryClient = useQueryClient()

    return {
        onSuccess: () => {
            void queryClient.invalidateQueries(
                managedDashboardKeys.listAnalyticsManagedDashboards(),
            )
            if (!silent) {
                toast.success(MANAGED_DASHBOARD_SAVED_MESSAGE)
            }
        },
        onError: (error: unknown) => {
            toast.error(
                getApiErrorMessage(
                    error,
                    MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
                ),
            )
        },
    }
}
