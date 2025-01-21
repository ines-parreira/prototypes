import React from 'react'

import {useTicketsFieldTrend} from 'hooks/reporting/useTicketsFieldTrend'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import {formatLabeledTooltipTimeSeriesData} from 'pages/stats/common/utils'
import {LINES_COLORS} from 'pages/stats/constants'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import {
    TicketInsightsFieldsMetric,
    TicketInsightsFieldsMetricConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import css from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldTrend.less'

export function TicketInsightsFieldTrend({chartId}: DashboardChartProps) {
    const {data, legendInfo, legendDatasetVisibility, granularity, isFetching} =
        useTicketsFieldTrend()

    const {hint, title} =
        TicketInsightsFieldsMetricConfig[
            TicketInsightsFieldsMetric.TicketInsightsFieldTrend
        ]

    return (
        <ChartCard title={title} hint={hint} chartId={chartId}>
            <LineChart
                isLoading={isFetching}
                customColors={LINES_COLORS}
                data={formatLabeledTooltipTimeSeriesData(
                    data,
                    legendInfo,
                    granularity
                )}
                displayLegend
                toggleLegend
                legendOnLeft
                wrapperclassNames={css.chart}
                skeletonHeight={328}
                defaultDatasetVisibility={legendDatasetVisibility}
                options={{
                    scales: {
                        y: {
                            ticks: {
                                precision: 0,
                            },
                        },
                    },
                }}
            />
        </ChartCard>
    )
}
