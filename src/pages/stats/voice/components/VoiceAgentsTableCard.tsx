import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { VoiceAgentsTable } from 'pages/stats/voice/components/VoiceAgentsTable/VoiceAgentsTable'
import { VOICE_CALL_ACTIVITY_TITLE } from 'pages/stats/voice/constants/voiceAgents'

export function VoiceAgentsTableCard({
    chartId,
    dashboard,
}: DashboardChartProps) {
    return (
        <ChartCard
            title={VOICE_CALL_ACTIVITY_TITLE}
            noPadding
            chartId={chartId}
            dashboard={dashboard}
        >
            <VoiceAgentsTable />
        </ChartCard>
    )
}
