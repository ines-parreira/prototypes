import React from 'react'

import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {formatLabeledTooltipTimeSeriesData} from 'pages/stats/common/utils'
import {useTicketsFieldTrend} from 'hooks/reporting/useTicketsFieldTrend'
import ChartCard from './ChartCard'
import LineChart from './common/components/charts/LineChart/LineChart'
import css from './TicketInsightsFieldTrend.less'

const LINES_COLORS = [
    colors['🖥 Modern'].Main.Variations.Primary_2.value,
    colors['🖥 Modern'].Feedback.Variations.Warning_4.value,
    colors['📺 Classic'].Accessory.Purple_text.value,
    colors['📺 Classic'].Accessory.Yellow_text.value,
    colors['📺 Classic'].Accessory.Blue_text.value,
    colors['📺 Classic'].Accessory.Brown_text.value,
    colors['🖥 Modern'].Neutral.Grey_5.value,
    colors['📺 Classic'].Feedback.Variations.Success_4.value,
    colors['📺 Classic'].Accessory.Navy_text.value,
    colors['🖤 Dark'].Main.Secondary.value,
]

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
