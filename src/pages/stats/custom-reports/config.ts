import {ReportsModalConfig} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import {SupportPerformanceOverviewReportConfig} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'

export const MAX_CHECKED_CHARTS = 20

export const REPORTS_MODAL_CONFIG: ReportsModalConfig = [
    {
        category: 'Support Performance',
        children: [SupportPerformanceOverviewReportConfig],
    },
]
