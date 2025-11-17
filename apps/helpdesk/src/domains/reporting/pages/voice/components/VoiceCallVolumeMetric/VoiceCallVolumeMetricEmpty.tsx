import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

type VoiceCallVolumeMetricProps = {
    title: string
    hint: string
} & DashboardChartProps

function VoiceCallVolumeMetricEmpty({
    title,
    hint,
    dashboard,
    chartId,
}: VoiceCallVolumeMetricProps) {
    return (
        <MetricCard
            title={title}
            chartId={chartId}
            dashboard={dashboard}
            hint={{
                title: hint,
            }}
            isLoading={false}
        >
            <BigNumberMetric>{NOT_AVAILABLE_PLACEHOLDER}</BigNumberMetric>
        </MetricCard>
    )
}

export default VoiceCallVolumeMetricEmpty
