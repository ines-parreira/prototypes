import { Metric } from 'hooks/reporting/metrics'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    MetricValueFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import MetricCard from 'pages/stats/MetricCard'
import { VoiceMetric } from 'state/ui/stats/types'

type FullProps = {
    title: string
    hint: string
    fetchData: () => Metric
    metricValueFormat?: MetricValueFormat
    metricName?: VoiceMetric
}

type EmptyProps = {
    title: string
    hint: string
}

type Props = FullProps & {
    shouldHide?: boolean
}

export const LiveVoiceMetricCard = ({
    title,
    hint,
    fetchData,
    metricValueFormat = 'integer',
    metricName,
    shouldHide = false,
}: Props) => {
    return shouldHide ? (
        <LiveVoiceMetricCardEmpty title={title} hint={hint} />
    ) : (
        <LiveVoiceMetricCardFull
            title={title}
            hint={hint}
            fetchData={fetchData}
            metricValueFormat={metricValueFormat}
            metricName={metricName}
        />
    )
}

const LiveVoiceMetricCardFull = ({
    title,
    hint,
    fetchData,
    metricValueFormat,
    metricName,
}: FullProps) => {
    const metric = fetchData()
    const value = metric.data?.value
    const isLoading = metric.isFetching
    const metricValue = formatMetricValue(
        value,
        metricValueFormat,
        NOT_AVAILABLE_PLACEHOLDER,
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

const LiveVoiceMetricCardEmpty = ({ title, hint }: EmptyProps) => {
    return (
        <MetricCard
            title={title}
            hint={{
                title: hint,
            }}
            isLoading={false}
        >
            <BigNumberMetric>{NOT_AVAILABLE_PLACEHOLDER}</BigNumberMetric>
        </MetricCard>
    )
}
