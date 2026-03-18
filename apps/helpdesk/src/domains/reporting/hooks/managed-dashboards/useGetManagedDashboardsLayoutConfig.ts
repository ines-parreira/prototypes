import { useMemo } from 'react'

import { useFetchManagedDashboards } from 'domains/reporting/hooks/managed-dashboards/useFetchManagedDashboards'
import {
    backendConfigToLayoutConfig,
    mergeWithDefaults,
} from 'domains/reporting/utils/managedDashboardMappers'
import type {
    DashboardLayoutConfig,
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export function useGetManagedDashboardsLayoutConfig({
    dashboardId,
    defaultLayoutConfig,
    tabId,
}: {
    dashboardId: ManagedDashboardId
    defaultLayoutConfig: DashboardLayoutConfig
    tabId: ManagedDashboardsTabId
}): { layoutConfig: DashboardLayoutConfig; isLoading: boolean } {
    const { data, isLoading } = useFetchManagedDashboards()

    const layoutConfig = useMemo(() => {
        const savedDashboard = data?.data?.data?.find(
            (d) => d.id === dashboardId,
        )

        if (!savedDashboard) return defaultLayoutConfig

        return mergeWithDefaults(
            backendConfigToLayoutConfig(
                savedDashboard.config,
                defaultLayoutConfig,
                tabId,
            ),
            defaultLayoutConfig,
        )
    }, [data, dashboardId, defaultLayoutConfig, tabId])

    return { layoutConfig, isLoading }
}
