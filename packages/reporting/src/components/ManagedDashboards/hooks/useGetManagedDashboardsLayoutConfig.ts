import { useMemo } from 'react'

import type { DashboardLayoutConfig } from '../types'
import {
    backendConfigToLayoutConfig,
    mergeWithDefaults,
} from '../utils/managedDashboardMappers'
import { useFetchManagedDashboards } from './useFetchManagedDashboards'

export function useGetManagedDashboardsLayoutConfig<TChart extends string>({
    dashboardId,
    defaultLayoutConfig,
    tabId,
    enabled = true,
}: {
    dashboardId: string
    defaultLayoutConfig: DashboardLayoutConfig<TChart>
    tabId: string
    enabled?: boolean
}): { layoutConfig: DashboardLayoutConfig<TChart>; isLoading: boolean } {
    const { data, isLoading } = useFetchManagedDashboards({ enabled })

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
