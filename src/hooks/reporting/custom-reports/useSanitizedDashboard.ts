import {useMemo} from 'react'

import {
    isChartRestricted,
    RestrictionsMap,
    useReportRestrictions,
} from 'hooks/reporting/custom-reports/useReportRestrictions'
import {
    CustomReportChild,
    CustomReportChildType,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'

const removeRestrictedCharts = (
    dashboard: CustomReportSchema,
    restrictionsMap: RestrictionsMap
): CustomReportSchema => {
    const filterChildren = <T extends CustomReportChild>(
        children: T[]
    ): T[] => {
        return children.filter((child) => {
            if (child.type === CustomReportChildType.Chart) {
                return !isChartRestricted(restrictionsMap, child.config_id)
            }

            child.children = filterChildren(child.children)

            return true
        })
    }

    return {
        ...dashboard,
        children: filterChildren(dashboard.children),
    }
}

export const useSanitizedDashboard = (customReport: CustomReportSchema) => {
    const {restrictionsMap} = useReportRestrictions()

    return useMemo(() => {
        return removeRestrictedCharts(customReport, restrictionsMap)
    }, [customReport, restrictionsMap])
}
