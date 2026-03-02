import { useMemo } from 'react'

import type { AnalyticsManagedDashboard } from '@gorgias/helpdesk-types'

import {
    backendConfigToLayoutConfig,
    mergeWithDefaults,
} from 'domains/reporting/utils/managedDashboardMappers'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export function useDashboardConfig(
    defaultConfig: DashboardLayoutConfig,
    savedDashboard: AnalyticsManagedDashboard | undefined,
): { layoutConfig: DashboardLayoutConfig } {
    const layoutConfig = useMemo(() => {
        if (!savedDashboard) {
            return defaultConfig
        }

        return mergeWithDefaults(
            backendConfigToLayoutConfig(savedDashboard.config, defaultConfig),
            defaultConfig,
        )
    }, [savedDashboard, defaultConfig])

    return { layoutConfig }
}
