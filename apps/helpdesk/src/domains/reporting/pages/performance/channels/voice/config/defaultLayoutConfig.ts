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
                        chartId: PerformanceChannelsVoiceChart.TotalCallsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                ],
            },
        ],
    }
