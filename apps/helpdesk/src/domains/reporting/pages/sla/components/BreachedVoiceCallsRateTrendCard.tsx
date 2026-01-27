import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { VoiceSlaMetricConfig } from 'domains/reporting/pages/sla/voice/VoiceSlaConfig'
import { VoiceSlaMetric } from 'domains/reporting/state/ui/stats/types'

export const BreachedVoiceCallsRateTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...VoiceSlaMetricConfig[VoiceSlaMetric.VoiceCallsBreachedRate]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
