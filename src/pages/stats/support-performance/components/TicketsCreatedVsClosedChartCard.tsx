import React from 'react'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/LineChart'
import {useCreatedVsClosedTicketsTimeSeries} from 'hooks/reporting/useCreatedVsClosedTicketsTimeSeries'

export const TITLE = 'Created vs. closed tickets'
export const HINT = 'Number of tickets created vs closed over time.'

export const TicketsCreatedVsClosedChartCard = () => {
    const {timeSeries, isLoading} = useCreatedVsClosedTicketsTimeSeries()

    return (
        <ChartCard title={TITLE} hint={HINT}>
            <LineChart
                isLoading={isLoading}
                data={timeSeries}
                hasBackground
                _displayLegacyTooltip
            />
        </ChartCard>
    )
}
