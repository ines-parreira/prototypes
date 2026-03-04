import { useMemo } from 'react'

import { useFetchManagedDashboards } from 'domains/reporting/hooks/managed-dashboards/useFetchManagedDashboards'
import {
    backendConfigToLayoutConfig,
    mergeWithDefaults,
} from 'domains/reporting/utils/managedDashboardMappers'
import type {
    DashboardLayoutConfig,
    ManagedDashboardId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export function useGetManagedDashboardsLayoutConfig({
    dashboardId,
    defaultLayoutConfig,
}: {
    dashboardId: ManagedDashboardId
    defaultLayoutConfig: DashboardLayoutConfig
}): DashboardLayoutConfig {
    const { data } = useFetchManagedDashboards()

    const layoutConfig = useMemo(() => {
        const savedDashboard = data?.data?.data?.find(
            (d) => d.id === dashboardId,
        )

        if (!savedDashboard) return defaultLayoutConfig

        return mergeWithDefaults(
            backendConfigToLayoutConfig(
                savedDashboard.config,
                defaultLayoutConfig,
            ),
            defaultLayoutConfig,
        )
    }, [data, dashboardId, defaultLayoutConfig])

    return layoutConfig
}
