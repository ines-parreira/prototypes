import React from 'react'

import _isNil from 'lodash/isNil'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { getBadgeTooltipForPreviousPeriod } from 'domains/reporting/pages/utils'
import { getDrillDownMetricData } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { PropsWithProduct } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/types'
import {
    VoiceOfCustomerMetric,
    VoiceOfCustomerMetricConfig,
} from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import {
    TrendOverviewChart,
    TrendOverviewChartConfig,
} from 'domains/reporting/pages/voice-of-customer/side-panel/TrendOverviewReport/TrendOverviewChartConfig'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'

const column = ProductInsightsTableColumns.PositiveSentiment

type Props = PropsWithProduct & {
    sentimentCustomFieldId: number
}

const { useTrend, interpretAs, metricFormat } =
    VoiceOfCustomerMetricConfig[
        VoiceOfCustomerMetric.PositiveSentimentsPerProduct
    ]

const { hint, title } =
    TrendOverviewChartConfig[
        TrendOverviewChart.PositiveSentimentsPerProductKpiChart
    ]

export const PositiveSentimentsPerProductKpi = ({
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
