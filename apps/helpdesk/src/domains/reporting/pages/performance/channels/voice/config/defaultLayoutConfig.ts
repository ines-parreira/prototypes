import type { DashboardLayoutConfig } from '@repo/reporting'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { PerformanceChannelsVoiceChart } from 'domains/reporting/pages/performance/channels/voice/ChannelsVoiceReportConfig'

export const DEFAULT_PERFORMANCE_CHANNELS_VOICE_LAYOUT: DashboardLayoutConfig<PerformanceChannelsVoiceChart> =
    {
        sections: [
            {
                id: 'kpis',
                type: ChartType.Card,
                items: [
                    {
                        chartId:
                            PerformanceChannelsVoiceChart.TicketsCreatedCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceChannelsVoiceChart.TotalCallsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsVoiceChart.AverageTalkTimeCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsVoiceChart.AverageWaitTimeCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsVoiceChart.OutboundCallsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceChannelsVoiceChart.InboundCallsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            PerformanceChannelsVoiceChart.UnansweredCallsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: PerformanceChannelsVoiceChart.MissedCallsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                ],
            },
            {
                id: 'visualisations',
                type: ChartType.Graph,
                items: [
                    {
                        chartId:
                            PerformanceChannelsVoiceChart.ConfigurableGraph,
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
                        chartId: PerformanceChannelsVoiceChart.AgentTable,
                        gridSize: 12,
                        visibility: true,
                        visibleColumns: [
                            'totalCalls',
                            'inboundAnswered',
                            'inboundMissed',
                            'inboundTransferred',
                            'inboundDeclined',
                            'outbound',
                            'averageTalkTime',
                        ],
                    },
                ],
            },
        ],
    }
