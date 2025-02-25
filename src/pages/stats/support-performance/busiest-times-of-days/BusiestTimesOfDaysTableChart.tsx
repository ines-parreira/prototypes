import React, { useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/ChartCard'
import Legend from 'pages/stats/common/components/Legend'
import { TableHeatmapSwitch } from 'pages/stats/common/components/Table/TableHeatmapSwitch'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import css from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays.less'
import { BusiestTimesOfDaysTable } from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
import { BusiestTimeOfDaysMetrics } from 'pages/stats/support-performance/busiest-times-of-days/types'
import {
    businessHoursLegend,
    getMetricQuery,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import { getSelectedMetric } from 'state/ui/stats/busiestTimesSlice'

const BUSIEST_TIME_OF_THE_WEEK_SECTION_LABEL = 'Busiest times of the week'
const TICKETS_CREATED_TOOLTIP = 'Tickets created per hour per day of the week'
const TICKETS_CLOSED_TOOLTIP = 'Tickets closed per hour per day of the week'
const TICKETS_REPLIED_TOOLTIP = 'Tickets replied per hour per day of the week'
const MESSAGES_SENT_TOOLTIP = 'Messages sent per hour per day of the week'

const SectionTooltips: Record<BusiestTimeOfDaysMetrics, string> = {
    [BusiestTimeOfDaysMetrics.MessagesSent]: MESSAGES_SENT_TOOLTIP,
    [BusiestTimeOfDaysMetrics.TicketsCreated]: TICKETS_CREATED_TOOLTIP,
    [BusiestTimeOfDaysMetrics.TicketsClosed]: TICKETS_CLOSED_TOOLTIP,
    [BusiestTimeOfDaysMetrics.TicketsReplied]: TICKETS_REPLIED_TOOLTIP,
}

const busiestHoursHeatmapLegend = {
    aheadLabel: 'Least busy',
    name: 'Busiest',
    background:
        'linear-gradient(90deg,' +
        'var(--analytics-heatmap-0)' +
        ' 25%, ' +
        'var(--analytics-heatmap-2)' +
        ' 25%, ' +
        'var(--analytics-heatmap-2)' +
        ' 50%, ' +
        'var(--analytics-heatmap-4)' +
        ' 50%, ' +
        'var(--analytics-heatmap-4)' +
        ' 75%, ' +
        'var(--analytics-heatmap-6)' +
        ' 75%, ' +
        'var(--analytics-heatmap-6)' +
        ' 100%)',
    shape: 'rectangle' as const,
}

export const BusiestTimesOfDaysTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const selectedMetric = useAppSelector(getSelectedMetric)
    const [isHeatmapMode, setIsHeatmapMode] = useState(true)
    const toggleHandler = () => setIsHeatmapMode(!isHeatmapMode)

    return (
        <ChartCard
            noPadding
            title={BUSIEST_TIME_OF_THE_WEEK_SECTION_LABEL}
            hint={{ title: SectionTooltips[selectedMetric] }}
            dashboard={dashboard}
            chartId={chartId}
            titleExtra={
                <TableHeatmapSwitch
                    isHeatmapMode={isHeatmapMode}
                    toggleHandler={toggleHandler}
                />
            }
        >
            <div className={css.legendWrapper}>
                <Legend
                    labels={[busiestHoursHeatmapLegend, businessHoursLegend]}
                />
            </div>

            <BusiestTimesOfDaysTable
                metricName={selectedMetric}
                useMetricQuery={getMetricQuery(selectedMetric)}
                isHeatmapMode={isHeatmapMode}
            />
        </ChartCard>
    )
}
