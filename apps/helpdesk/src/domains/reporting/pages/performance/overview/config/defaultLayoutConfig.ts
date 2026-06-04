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
                    {
                        chartId:
                            PerformanceOverviewChart.HumanResponseTimeAfterAiHandoffCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceOverviewChart.CreatedTicketsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceOverviewChart.ClosedTicketsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceOverviewChart.TicketsRepliedCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceOverviewChart.MessagesSentCard,
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
                        chartId: PerformanceOverviewChart.ConfigurableBarGraph,
                        gridSize: 6,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceOverviewChart.ConfigurableLineGraph,
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
                        chartId: PerformanceOverviewChart.AgentTable,
                        gridSize: 12,
                        visibility: true,
                        visibleColumns: [
                            'resolutionTime',
                            'firstResponseTime',
                            'messagesPerTicket',
                            'averageCsat',
                        ],
                    },
                    {
                        chartId: PerformanceOverviewChart.ChannelTable,
                        gridSize: 12,
                        visibility: true,
                        visibleColumns: [
                            'resolutionTime',
                            'firstResponseTime',
                            'messagesPerTicket',
                            'averageCsat',
                        ],
                    },
                ],
            },
        ],
    }
