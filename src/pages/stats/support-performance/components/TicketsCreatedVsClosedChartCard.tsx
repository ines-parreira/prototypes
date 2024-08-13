import React from 'react'
import ChartCard from 'pages/stats/ChartCard'
import {useCreatedVsClosedTicketsTimeSeries} from 'hooks/reporting/useCreatedVsClosedTicketsTimeSeries'
import {CREATED_VS_CLOSED_TICKETS_LABEL} from 'services/reporting/constants'
import {TICKETS_CREATED_VS_CLOSED_HINT} from 'pages/stats/SupportPerformanceOverviewConfig'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'

export const TicketsCreatedVsClosedChartCard = ({
    isAnalyticsNewFilters = false,
}: {
    isAnalyticsNewFilters?: boolean
}) => {
    const {timeSeries, isLoading} = useCreatedVsClosedTicketsTimeSeries(
        isAnalyticsNewFilters
    )

    return (
        <ChartCard
            title={CREATED_VS_CLOSED_TICKETS_LABEL}
            hint={TICKETS_CREATED_VS_CLOSED_HINT}
        >
            <BarChart
                isLoading={isLoading}
                data={timeSeries}
                hasBackground
                _displayLegacyTooltip
                displayLegend
                legendOnLeft
            />
        </ChartCard>
    )
}
