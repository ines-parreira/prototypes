import React from 'react'

import {useTagsTimeSeries} from 'hooks/reporting/ticket-insights/useTagsTimeSeries'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import {formatLabeledTooltipTimeSeriesData} from 'pages/stats/common/utils'
import {LINES_COLORS} from 'pages/stats/constants'
import {
    TicketInsightsTagsMetric,
    TicketInsightsTagsMetricConfig,
} from 'pages/stats/ticket-insights/tags/TagsMetricConfig'

export function TagsTrendChart() {
    const {data, legendInfo, legendDatasetVisibility, granularity, isFetching} =
        useTagsTimeSeries()

    const {hint, title} =
        TicketInsightsTagsMetricConfig[TicketInsightsTagsMetric.TagsTrendChart]

    return (
        <ChartCard title={title} hint={hint}>
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
                wrapperclassNames="full-width"
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
