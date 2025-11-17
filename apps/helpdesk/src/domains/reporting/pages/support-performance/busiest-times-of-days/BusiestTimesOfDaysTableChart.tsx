import React, { useState } from 'react'

import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import Legend from 'domains/reporting/pages/common/components/Legend'
import { TableHeatmapSwitch } from 'domains/reporting/pages/common/components/Table/TableHeatmapSwitch'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import css from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDays.less'
import { BusiestTimesOfDaysTable } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
import { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import {
    businessHoursLegend,
    getMetricQuery,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'
import { getSelectedMetric } from 'domains/reporting/state/ui/stats/busiestTimesSlice'
import useAppSelector from 'hooks/useAppSelector'

const BUSIEST_TIME_OF_THE_WEEK_SECTION_LABEL = 'Busiest times of the week'
const TICKETS_CREATED_TOOLTIP = 'Tickets created per hour per day of the week'
const TICKETS_CLOSED_TOOLTIP = 'Tickets closed per hour per day of the week'
const TICKETS_REPLIED_TOOLTIP = 'Tickets replied per hour per day of the week'
const MESSAGES_SENT_TOOLTIP = 'Messages sent per hour per day of the week'
const MESSAGES_RECEIVED_TOOLTIP =
    'Messages received per hour per day of the week'

const SectionTooltips: Record<BusiestTimeOfDaysMetrics, string> = {
    [BusiestTimeOfDaysMetrics.MessagesSent]: MESSAGES_SENT_TOOLTIP,
    [BusiestTimeOfDaysMetrics.MessagesReceived]: MESSAGES_RECEIVED_TOOLTIP,
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
