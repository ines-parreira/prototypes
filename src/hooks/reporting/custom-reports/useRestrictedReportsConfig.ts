import { useReportRestrictions } from 'hooks/reporting/custom-reports/useReportRestrictions'
import { REPORTS_CONFIG } from 'pages/stats/custom-reports/config'
import { ChartConfig } from 'pages/stats/custom-reports/types'

export const useRestrictedReportsConfig = () => {
    const { reportRestrictionsMap, chartRestrictionsMap } =
        useReportRestrictions()
    return REPORTS_CONFIG.map((section) => ({
        ...section,
        children: section.children
            .filter(
                (report) => !Boolean(reportRestrictionsMap[report.config.id]),
            )
            .map((config) => {
                return {
                    ...config,
                    config: {
                        ...config.config,
                        charts: Object.entries(config.config.charts).reduce<
                            Record<string, ChartConfig>
                        >((acc, [key, value]) => {
                            if (!Boolean(chartRestrictionsMap[key])) {
                                acc[key] = value
                            }
                            return acc
                        }, {}),
                    },
                }
            }),
    }))
}
