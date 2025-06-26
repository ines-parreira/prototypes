import React from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { getBadgeTooltipForPreviousPeriod } from 'pages/stats/utils'
import {
    VoiceOfCustomerMetric,
    VoiceOfCustomerMetricConfig,
} from 'pages/stats/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import {
    TrendOverviewChart,
    TrendOverviewChartConfig,
} from 'pages/stats/voice-of-customer/side-panel/TrendOverviewReport/TrendOverviewChartConfig'

type Props = {
    sentimentCustomFieldId: number
    productId: string
}

const { useTrend, interpretAs, metricFormat } =
    VoiceOfCustomerMetricConfig[
        VoiceOfCustomerMetric.NegativeSentimentsPerProduct
    ]

const { hint, title } =
    TrendOverviewChartConfig[
        TrendOverviewChart.NegativeSentimentsPerProductKpiChart
    ]

export const NegativeSentimentsPerProductKpi = ({
    sentimentCustomFieldId,
    productId,
}: Props) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const trend = useTrend(
        cleanStatsFilters,
        userTimezone,
        sentimentCustomFieldId,
        productId,
    )
    const formattedMetric = formatMetricValue(
        trend.data?.value,
        metricFormat,
        NOT_AVAILABLE_PLACEHOLDER,
    )

    return (
        <MetricCard hint={hint} title={title} isLoading={trend.isFetching}>
            <BigNumberMetric
                isLoading={!trend.data}
                trendBadge={
                    <TrendBadge
                        interpretAs={interpretAs}
                        isLoading={!trend.data}
                        value={trend.data?.value}
                        prevValue={trend.data?.prevValue}
                        tooltipData={{
                            period: getBadgeTooltipForPreviousPeriod(
                                cleanStatsFilters.period,
                            ),
                        }}
                        metricFormat={metricFormat}
                    />
                }
            >
                {formattedMetric}
            </BigNumberMetric>
        </MetricCard>
    )
}
