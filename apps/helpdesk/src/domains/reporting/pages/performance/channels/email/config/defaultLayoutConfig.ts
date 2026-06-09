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
                        chartId:
                            PerformanceChannelsEmailChart.CreatedTicketsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceChannelsEmailChart.AverageCSATCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsEmailChart.ResolutionTimeCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsEmailChart.FirstResponseTimeCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsEmailChart.MessagesPerTicketCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsEmailChart.HumanResponseTimeAfterAiHandoffCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsEmailChart.ClosedTicketsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsEmailChart.TicketsRepliedCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceChannelsEmailChart.MessagesSentCard,
                        gridSize: 3,
                        visibility: true,
                    },
                ],
            },
        ],
    }
