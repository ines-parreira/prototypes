import React from 'react'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/LineChart'
import {useCreatedVsClosedTicketsTimeSeries} from 'hooks/reporting/useCreatedVsClosedTicketsTimeSeries'
import {CREATED_VS_CLOSED_TICKETS_LABEL} from 'services/reporting/constants'
import {TICKETS_CREATED_VS_CLOSED_HINT} from 'pages/stats/SupportPerformanceOverviewConfig'

export const TicketsCreatedVsClosedChartCard = () => {
    const {timeSeries, isLoading} = useCreatedVsClosedTicketsTimeSeries()

    return (
        <ChartCard
            title={CREATED_VS_CLOSED_TICKETS_LABEL}
            hint={TICKETS_CREATED_VS_CLOSED_HINT}
        >
            <LineChart
                isLoading={isLoading}
                data={timeSeries}
                hasBackground
                _displayLegacyTooltip
            />
        </ChartCard>
    )
}
