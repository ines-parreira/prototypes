import React from 'react'

import _isNil from 'lodash/isNil'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { getBadgeTooltipForPreviousPeriod } from 'pages/stats/utils'
import { getDrillDownMetricData } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { PropsWithProduct } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/types'
import {
    VoiceOfCustomerMetric,
    VoiceOfCustomerMetricConfig,
} from 'pages/stats/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import {
    TrendOverviewChart,
    TrendOverviewChartConfig,
} from 'pages/stats/voice-of-customer/side-panel/TrendOverviewReport/TrendOverviewChartConfig'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

type Props = PropsWithProduct & {
    sentimentCustomFieldId: number
}

const { useTrend, interpretAs, metricFormat } =
    VoiceOfCustomerMetricConfig[
        VoiceOfCustomerMetric.NegativeSentimentsPerProduct
    ]

const { hint, title } =
    TrendOverviewChartConfig[
        TrendOverviewChart.NegativeSentimentsPerProductKpiChart
    ]

const column = ProductInsightsTableColumns.NegativeSentiment

export const NegativeSentimentsPerProductKpi = ({
    sentimentCustomFieldId,
    product,
}: Props) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const trend = useTrend(
        cleanStatsFilters,
        userTimezone,
        sentimentCustomFieldId,
        product.id,
    )

    const formattedMetric = formatMetricValue(
        trend.data?.value,
        metricFormat,
        NOT_AVAILABLE_PLACEHOLDER,
    )

    const metricData = getDrillDownMetricData(
        column,
        product,
        sentimentCustomFieldId,
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
                <DrillDownModalTrigger
                    metricData={metricData}
                    enabled={!_isNil(trend.data?.value)}
                    highlighted
                >
                    {formattedMetric}
                </DrillDownModalTrigger>
            </BigNumberMetric>
        </MetricCard>
    )
}
