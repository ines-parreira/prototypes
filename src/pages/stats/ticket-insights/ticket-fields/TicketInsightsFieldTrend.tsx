import React from 'react'

import {formatLabeledTooltipTimeSeriesData} from 'pages/stats/common/utils'
import {useTicketsFieldTrend} from 'hooks/reporting/useTicketsFieldTrend'
import {LINES_COLORS} from 'pages/stats/constants'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import css from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldTrend.less'

export function TicketInsightsFieldTrend() {
    const {data, legendInfo, legendDatasetVisibility, granularity, isFetching} =
        useTicketsFieldTrend()

    return (
        <ChartCard
            title="Trend"
            hint={{
                title: 'Evolution of the top 10 used values during the selected timeframe. Values are grouped by the date the value was added to a ticket.',
            }}
        >
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
