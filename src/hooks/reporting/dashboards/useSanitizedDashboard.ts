import { useMemo } from 'react'

import {
    DashboardChild,
    DashboardChildType,
    DashboardSchema,
} from 'pages/stats/dashboards/types'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'

const removeRestrictedCharts = (
    dashboard: DashboardSchema,
    isChartRestrictedToCurrentUser: (chartId: string) => boolean,
): DashboardSchema => {
    const filterChildren = <T extends DashboardChild>(children: T[]): T[] => {
        return children.reduce<T[]>((acc, child) => {
            if (child.type === DashboardChildType.Chart) {
                if (!isChartRestrictedToCurrentUser(child.config_id)) {
                    acc.push(child)
                }
            } else {
                acc.push({
                    ...child,
                    children: filterChildren(child.children),
                })
            }

            return acc
        }, [])
    }

    return {
        ...dashboard,
        children: filterChildren(dashboard.children),
    }
}

export const useSanitizedDashboard = (dashboard: DashboardSchema) => {
    const { isChartRestrictedToCurrentUser } = useReportChartRestrictions()

    return useMemo(() => {
        return removeRestrictedCharts(dashboard, isChartRestrictedToCurrentUser)
    }, [dashboard, isChartRestrictedToCurrentUser])
}
