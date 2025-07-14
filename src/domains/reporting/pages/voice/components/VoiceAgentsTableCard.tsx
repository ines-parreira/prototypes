import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { VoiceAgentsTable } from 'domains/reporting/pages/voice/components/VoiceAgentsTable/VoiceAgentsTable'
import { VOICE_CALL_ACTIVITY_TITLE } from 'domains/reporting/pages/voice/constants/voiceAgents'

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
