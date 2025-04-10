import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

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
