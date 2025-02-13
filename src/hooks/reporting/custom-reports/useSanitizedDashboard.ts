import {useMemo} from 'react'

import {
    CustomReportChild,
    CustomReportChildType,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import {useReportChartRestrictions} from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'

const removeRestrictedCharts = (
    dashboard: CustomReportSchema,
    isChartRestrictedToCurrentUser: (chartId: string) => boolean
): CustomReportSchema => {
    const filterChildren = <T extends CustomReportChild>(
        children: T[]
    ): T[] => {
        return children.reduce<T[]>((acc, child) => {
            if (child.type === CustomReportChildType.Chart) {
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

export const useSanitizedDashboard = (customReport: CustomReportSchema) => {
    const {isChartRestrictedToCurrentUser} = useReportChartRestrictions()

    return useMemo(() => {
        return removeRestrictedCharts(
            customReport,
            isChartRestrictedToCurrentUser
        )
    }, [customReport, isChartRestrictedToCurrentUser])
}
