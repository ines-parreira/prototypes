import { Metric } from 'hooks/reporting/metrics'
import { voiceCallCountQueryFactory } from 'models/reporting/queryFactories/voice/voiceCall'
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
    fetchData: () => Metric
    metricValueFormat?: MetricValueFormat
    metricName?: VoiceMetric
    showPercentage?: boolean
    totalCallsQueryFactory?: ReturnType<typeof voiceCallCountQueryFactory>
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
    showPercentage = false,
    shouldHide = false,
    totalCallsQueryFactory,
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
            showPercentage={showPercentage}
            totalCallsQueryFactory={totalCallsQueryFactory}
        />
    )
}

const LiveVoiceMetricCardFull = ({
    title,
    hint,
    fetchData,
    metricValueFormat,
    metricName,
    showPercentage = false,
    totalCallsQueryFactory,
}: FullProps) => {
    const metric = fetchData()
    const value = metric.data?.value
    const isLoading = metric.isFetching
    const {
        metricValue,
        isFetching: isAdditionalDataFetching,
        selectedFormat,
        setSelectedFormat,
    } = useMetricFormat({
        isPercentageEnabled: showPercentage,
        value,
        queryFactory: totalCallsQueryFactory,
        defaultValueFormat: showPercentage ? 'percent' : metricValueFormat,
    })

    return (
        <MetricCard
            title={title}
            hint={{
                title: hint,
            }}
            isLoading={isLoading || isAdditionalDataFetching}
            titleExtra={
                totalCallsQueryFactory && (
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
