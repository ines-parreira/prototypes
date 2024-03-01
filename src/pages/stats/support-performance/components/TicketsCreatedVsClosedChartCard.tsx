import React from 'react'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import ChartCard from 'pages/stats/ChartCard'
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
