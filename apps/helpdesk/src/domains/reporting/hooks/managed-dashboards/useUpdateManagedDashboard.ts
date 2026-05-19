import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useUpdateAnalyticsManagedDashboard,
} from '@gorgias/helpdesk-queries'
import type { AnalyticsManagedDashboard } from '@gorgias/helpdesk-types'

import {
    MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
    MANAGED_DASHBOARD_SAVED_MESSAGE,
} from 'domains/reporting/hooks/managed-dashboards/useCreateManagedDashboard'
import { buildDashboardConfig } from 'domains/reporting/utils/managedDashboardMappers'
import { isGorgiasApiError } from 'models/api/types'
import type {
    DashboardLayoutConfig,
    LayoutSection,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export const managedDashboardKeys = queryKeys.analyticsManagedDashboards

type UseUpdateManagedDashboardOptions = {
    silent?: boolean
}

export function useUpdateManagedDashboard(
    options?: UseUpdateManagedDashboardOptions,
) {
    const { silent = false } = options ?? {}
    const queryClient = useQueryClient()

    const { mutate: saveDashboard, isLoading } =
        useUpdateAnalyticsManagedDashboard({
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
                    const message = isGorgiasApiError(error)
                        ? error.response.data.error.msg
                        : MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE
                    toast.error(message)
                },
            },
        })

    const updateSection = useCallback(
        (
            dashboardId: string,
            tabId: ManagedDashboardsTabId,
            tabName: string,
            layoutConfig: DashboardLayoutConfig,
            sectionId: string,
            sectionUpdater: (section: LayoutSection) => LayoutSection,
            onSuccess?: () => void,
        ) => {
            const updatedLayoutConfig: DashboardLayoutConfig = {
                sections: layoutConfig.sections.map((section) =>
                    section.id === sectionId
                        ? sectionUpdater(section)
                        : section,
                ),
            }

            const cachedList = queryClient.getQueryData<{
                data: { data: AnalyticsManagedDashboard[] }
            }>(managedDashboardKeys.listAnalyticsManagedDashboards())

            const existingDashboard = cachedList?.data?.data?.find(
                (d) => d.id === dashboardId,
            )

            const dashboardConfig = buildDashboardConfig(
                dashboardId,
                tabId,
                tabName,
                updatedLayoutConfig,
                existingDashboard?.config,
            )

            saveDashboard(
                { id: dashboardId, data: { config: dashboardConfig } },
                { onSuccess },
            )
        },
        [queryClient, saveDashboard],
    )

    return { updateSection, isLoading }
}
