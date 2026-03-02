import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useCreateAnalyticsManagedDashboard,
} from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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
    const dispatch = useAppDispatch()

    return useCreateAnalyticsManagedDashboard({
        mutation: {
            onSuccess: () => {
                void queryClient.invalidateQueries(
                    managedDashboardKeys.listAnalyticsManagedDashboards(),
                )
                if (!silent) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: MANAGED_DASHBOARD_SAVED_MESSAGE,
                        }),
                    )
                }
            },
            onError: (error) => {
                const errorMessage = isGorgiasApiError(error)
                    ? error.response.data.error.msg
                    : MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE

                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: errorMessage,
                    }),
                )
            },
        },
    })
}
