import type { DashboardLayoutConfig } from '@repo/reporting'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { PerformanceOverviewChart } from 'domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig'

export const DEFAULT_PERFORMANCE_OVERVIEW_LAYOUT: DashboardLayoutConfig<PerformanceOverviewChart> =
    {
        sections: [
            {
                id: 'kpis',
                type: ChartType.Card,
                items: [
                    {
                        chartId: PerformanceOverviewChart.AverageCSATCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceOverviewChart.ResolutionTimeCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceOverviewChart.MessagesPerTicketCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceOverviewChart.FirstResponseTimeCard,
                        gridSize: 3,
                        visibility: true,
                    },
                ],
            },
        ],
    }
