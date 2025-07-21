import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
} from 'domains/reporting/pages/self-service/constants'

export const PerformanceByFeatureReportConfig: ReportConfig<string> = {
    id: ReportsIDs.AutomatePerformanceByFeatureReportConfig,
    reportName: PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    reportPath: ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
    charts: {},
    reportFilters: {
        persistent: [],
        optional: [],
    },
}
