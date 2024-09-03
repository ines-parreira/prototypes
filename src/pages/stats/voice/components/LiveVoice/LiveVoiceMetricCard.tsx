import React from 'react'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import {
    formatMetricValue,
    MetricValueFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import MetricCard from 'pages/stats/MetricCard'

type Props = {
    title: string
    hint: string
    metricValueFormat?: MetricValueFormat
    value?: number | null
    isLoading: boolean
}

export default function LiveVoiceMetricCard({
    title,
    hint,
    metricValueFormat = 'integer',
    value,
    isLoading,
}: Props) {
    const metricValue = formatMetricValue(
        value,
        metricValueFormat,
        NOT_AVAILABLE_PLACEHOLDER
    )

    return (
        <MetricCard
            title={title}
            hint={{
                title: hint,
            }}
            isLoading={isLoading}
        >
            <BigNumberMetric isLoading={isLoading}>
                {metricValue}
            </BigNumberMetric>
        </MetricCard>
    )
}
