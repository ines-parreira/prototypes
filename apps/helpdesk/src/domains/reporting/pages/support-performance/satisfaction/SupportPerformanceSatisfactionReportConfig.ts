import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import { STATS_ROUTES } from 'routes/constants'

export const SUPPORT_PERFORMANCE_SATISFACTION_PAGE_TITLE = 'Satisfaction'

export const SupportPerformanceSatisfactionReportConfig: ReportConfig<string> =
    {
        id: ReportsIDs.SupportPerformanceSatisfactionReportConfig,
        reportName: SUPPORT_PERFORMANCE_SATISFACTION_PAGE_TITLE,
        reportPath: STATS_ROUTES.SUPPORT_PERFORMANCE_SATISFACTION,
        charts: {},
        reportFilters: {
            persistent: [],
            optional: [],
        },
    }
