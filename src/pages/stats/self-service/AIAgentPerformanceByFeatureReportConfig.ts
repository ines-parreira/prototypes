import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { ReportConfig } from 'pages/stats/dashboards/types'
import {
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
} from 'pages/stats/self-service/constants'

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
