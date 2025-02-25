import React from 'react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import MetricCard from 'pages/stats/MetricCard'

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
            <BigNumberMetric>-</BigNumberMetric>
        </MetricCard>
    )
}

export default VoiceCallVolumeMetricEmpty
