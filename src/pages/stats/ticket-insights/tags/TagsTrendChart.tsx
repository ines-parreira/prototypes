import React from 'react'

import {useTagsTimeSeries} from 'hooks/reporting/ticket-insights/useTagsTimeSeries'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import {formatLabeledTooltipTimeSeriesData} from 'pages/stats/common/utils'
import {LINES_COLORS} from 'pages/stats/constants'

export function TagsTrendChart() {
    const {data, legendInfo, legendDatasetVisibility, granularity, isFetching} =
        useTagsTimeSeries()

    return (
        <ChartCard
            title="Trend"
            hint={{
                title: 'Evolution of the top 10 used tags during the selected timeframe. Values are grouped by the date the tag was added to a ticket.',
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
