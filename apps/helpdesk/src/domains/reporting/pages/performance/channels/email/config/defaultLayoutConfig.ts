import type { DashboardLayoutConfig } from '@repo/reporting'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { PerformanceChannelsEmailChart } from 'domains/reporting/pages/performance/channels/email/ChannelsEmailReportConfig'

export const DEFAULT_PERFORMANCE_CHANNELS_EMAIL_LAYOUT: DashboardLayoutConfig<PerformanceChannelsEmailChart> =
    {
        sections: [
            {
                id: 'kpis',
                type: ChartType.Card,
                items: [
                    {
                        chartId: PerformanceChannelsEmailChart.AverageCSATCard,
                        gridSize: 3,
                        visibility: true,
                    },
                ],
            },
        ],
    }
