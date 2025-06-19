import { VoiceCallSummaryMeasure } from 'models/reporting/cubes/VoiceCallSummaryCube'
import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import { TableValueModeSwitch } from 'pages/stats/common/components/Table/TableValueModeSwitch'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    MetricValueFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { ValueMode, VoiceMetric } from 'state/ui/stats/types'

import { useMetricFormat } from '../../hooks/useMetricFormat'

type FullProps = {
    title: string
    hint: string
    metric: {
        data?: number | null | Record<VoiceCallSummaryMeasure, number | null>
        isFetching: boolean
    }
    metricValueFormat?: MetricValueFormat
    metricName?: VoiceMetric
    showPercentage?: boolean
    measure?: VoiceCallSummaryMeasure
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
    metricValueFormat = 'integer',
    metricName,
    showPercentage = false,
    shouldHide = false,
    metric,
    measure,
}: Props) => {
    return shouldHide ? (
        <LiveVoiceMetricCardEmpty title={title} hint={hint} />
    ) : (
        <LiveVoiceMetricCardFull
            title={title}
            hint={hint}
            metricValueFormat={metricValueFormat}
            metricName={metricName}
            showPercentage={showPercentage}
            metric={metric}
            measure={measure}
        />
    )
}

const LiveVoiceMetricCardFull = ({
    title,
    hint,
    metricValueFormat,
    metricName,
    showPercentage = false,
    metric,
    measure,
}: FullProps) => {
    const value = getMetricValue(metric.data, measure)
    const isLoading = metric.isFetching
    const percentageOfValue = getMetricValue(
        metric.data,
        VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal,
    )

    const {
        metricValue,
        isFetching: isAdditionalDataFetching,
        selectedFormat,
        setSelectedFormat,
    } = useMetricFormat({
        isPercentageEnabled: showPercentage,
        value,
        percentageOfValue,
        defaultValueFormat: showPercentage ? 'percent' : metricValueFormat,
        storageKey: metricName,
    })

    return (
        <MetricCard
            title={title}
            hint={{
                title: hint,
            }}
            isLoading={isLoading || isAdditionalDataFetching}
            titleExtra={
                percentageOfValue !== null && (
                    <TableValueModeSwitch
                        size="extraSmall"
                        valueMode={
                            selectedFormat === 'percent'
                                ? ValueMode.Percentage
                                : ValueMode.TotalCount
                        }
                        toggleValueMode={() =>
                            setSelectedFormat(
                                selectedFormat === 'percent'
                                    ? 'integer'
                                    : 'percent',
                            )
                        }
                    />
                )
            }
        >
            <BigNumberMetric isLoading={isLoading || isAdditionalDataFetching}>
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

const getMetricValue = (
    data?: number | null | Record<VoiceCallSummaryMeasure, number | null>,
    measure?: VoiceCallSummaryMeasure,
): number | null => {
    if (typeof data === 'object') {
        return (measure && data?.[measure]) ?? null
    }

    return data ?? null
}
