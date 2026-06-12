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
            {
                id: 'visualizations',
                type: ChartType.Graph,
                items: [
                    {
                        chartId:
                            PerformanceChannelsEmailChart.ConfigurableBarGraph,
                        gridSize: 6,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsEmailChart.ConfigurableLineGraph,
                        gridSize: 6,
                        visibility: true,
                    },
                ],
            },
            {
                id: 'breakdown',
                type: ChartType.Table,
                tableTitle: 'Performance breakdown',
                items: [
                    {
                        chartId: PerformanceChannelsEmailChart.AgentTable,
                        gridSize: 12,
                        visibility: true,
                        visibleColumns: [
                            'createdTickets',
                            'averageCsat',
                            'resolutionTime',
                            'firstResponseTime',
                        ],
                    },
                    {
                        chartId: PerformanceChannelsEmailChart.SubChannelTable,
                        gridSize: 12,
                        visibility: true,
                        visibleColumns: [
                            'createdTickets',
                            'averageCsat',
                            'resolutionTime',
                            'firstResponseTime',
                        ],
                    },
                ],
            },
        ],
    }
