import React from 'react'

import {useCreatedVsClosedTicketsTimeSeries} from 'hooks/reporting/useCreatedVsClosedTicketsTimeSeries'
import ChartCard from 'pages/stats/ChartCard'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import {TICKETS_CREATED_VS_CLOSED_HINT} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {CREATED_VS_CLOSED_TICKETS_LABEL} from 'services/reporting/constants'

export const TicketsCreatedVsClosedChart = ({chartId}: DashboardChartProps) => {
    const {timeSeries, isLoading} = useCreatedVsClosedTicketsTimeSeries()

    return (
        <ChartCard
            title={CREATED_VS_CLOSED_TICKETS_LABEL}
            hint={TICKETS_CREATED_VS_CLOSED_HINT}
            chartId={chartId}
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
