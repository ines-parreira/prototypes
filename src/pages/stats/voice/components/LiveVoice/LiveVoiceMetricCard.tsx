import React from 'react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import {
    formatMetricValue,
    MetricValueFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
import {VoiceMetric} from 'state/ui/stats/types'

type Props = {
    title: string
    hint: string
    metricValueFormat?: MetricValueFormat
    value?: number | null
    isLoading: boolean
    metricName?: VoiceMetric
}

export default function LiveVoiceMetricCard({
    title,
    hint,
    metricValueFormat = 'integer',
    value,
    isLoading,
    metricName,
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
                {metricName ? (
                    <DrillDownModalTrigger
                        metricData={{
                            metricName,
                            title,
                        }}
                        enabled={!!value}
                        useNewFilterData
                    >
                        {metricValue}
                    </DrillDownModalTrigger>
                ) : (
                    metricValue
                )}
            </BigNumberMetric>
        </MetricCard>
    )
}
