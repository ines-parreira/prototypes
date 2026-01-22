import { formatMetricValue, NOT_AVAILABLE_PLACEHOLDER } from '@repo/reporting'
import type { MetricValueFormat } from '@repo/reporting'

import { VoiceCallSummaryMeasure } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { TableValueModeSwitch } from 'domains/reporting/pages/common/components/Table/TableValueModeSwitch'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { useMetricFormat } from 'domains/reporting/pages/voice/hooks/useMetricFormat'
import type { VoiceMetric } from 'domains/reporting/state/ui/stats/types'
import { ValueMode } from 'domains/reporting/state/ui/stats/types'

type FullProps = {
    title: string
    hint: string
    metric: {
        data?: number | null | Record<VoiceCallSummaryMeasure, number | null>
        isLoading?: boolean
        dataUpdatedAt?: number | null
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
    const isLoading = metric.isLoading
    const percentageOfValue = getMetricValue(
        metric.data,
        VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal,
    )

    const defaultFormatValue = formatMetricValue(
        value,
        metricValueFormat,
        NOT_AVAILABLE_PLACEHOLDER,
    )

    const {
        metricValue: computedMetricValue,
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

    const metricValue =
        metricValueFormat === 'percent'
            ? defaultFormatValue
            : computedMetricValue

    return (
        <MetricCard
            title={title}
            hint={{
                title: hint,
            }}
            isLoading={isLoading || isAdditionalDataFetching}
            titleExtra={
                showPercentage &&
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
    data?: number | null | Record<string, number | null>,
    measure?: VoiceCallSummaryMeasure,
): number | null => {
    if (typeof data === 'object') {
        return (
            (measure && data?.[measure]) ??
            (measure && data?.[getV2MeasureFromMetricName(measure!)]) ??
            null
        )
    }

    return data ?? null
}

const getV2MeasureFromMetricName = (
    metricName: VoiceCallSummaryMeasure,
): string => {
    switch (metricName) {
        case VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal:
            return 'inboundVoiceCallsCount'
        case VoiceCallSummaryMeasure.VoiceCallSummaryOutboundTotal:
            return 'outboundVoiceCallsCount'
        case VoiceCallSummaryMeasure.VoiceCallSummaryAnsweredTotal:
            return 'answeredVoiceCallsCount'
        case VoiceCallSummaryMeasure.VoiceCallSummaryCancelledTotal:
            return 'cancelledVoiceCallsCount'
        case VoiceCallSummaryMeasure.VoiceCallSummaryAbandonedTotal:
            return 'abandonedVoiceCallsCount'
        case VoiceCallSummaryMeasure.VoiceCallSummaryMissedTotal:
            return 'missedVoiceCallsCount'
        case VoiceCallSummaryMeasure.VoiceCallSummaryUnansweredTotal:
            return 'unansweredVoiceCallsCount'
        case VoiceCallSummaryMeasure.VoiceCallSummaryCallbackRequestedTotal:
            return 'callbackRequestedVoiceCallsCount'
        case VoiceCallSummaryMeasure.VoiceCallSummaryAverageTalkTime:
            return 'averageTalkTimeInSeconds'
        case VoiceCallSummaryMeasure.VoiceCallSummaryAverageWaitTime:
            return 'averageWaitTimeInSeconds'
    }
    return ''
}
