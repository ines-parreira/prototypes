import { REPORTS_CONFIG } from 'domains/reporting/pages/dashboards/config'
import { ChartConfig } from 'domains/reporting/pages/dashboards/types'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'

export const useRestrictedReportsConfig = () => {
    const { isChartRestrictedToCurrentUser, isReportRestrictedToCurrentUser } =
        useReportChartRestrictions()
    return REPORTS_CONFIG.map((section) => ({
        ...section,
        children: section.children
            .filter(
                (report) => !isReportRestrictedToCurrentUser(report.config.id),
            )
            .map((config) => {
                return {
                    ...config,
                    config: {
                        ...config.config,
                        charts: Object.entries(config.config.charts).reduce<
                            Record<string, ChartConfig>
                        >((acc, [key, value]) => {
                            if (!isChartRestrictedToCurrentUser(key)) {
                                acc[key] = value
                            }
                            return acc
                        }, {}),
                    },
                }
            }),
    }))
}
