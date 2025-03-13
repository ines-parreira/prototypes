import React, { useMemo } from 'react'

import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import { useAutomationRateTimeSeriesData } from 'hooks/reporting/automate/useAutomationRateTimeSeriesData'
import {
    automatePercentLabel,
    getGreyAreaAndChartParam,
    renderAutomateTooltipLabel,
    renderAutomateXTickLabel,
} from 'hooks/reporting/automate/utils'
import { AUTOMATION_RATE_TOOLTIP } from 'pages/automate/automate-metrics/AutomationRateMetric'
import {
    formatAutomationRateTimeSeriesData,
    getGreyAreaHint,
} from 'pages/stats/automate/overview/utils'
import ChartCard from 'pages/stats/ChartCard'
import { LineChart } from 'pages/stats/common/components/charts/LineChart/LineChart'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { AUTOMATION_RATE_LABEL } from 'pages/stats/self-service/constants'

export const AutomationRateGraphChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone, granularity } = useAutomateFilters()
    const { data: timeSeries, isFetching } = useAutomationRateTimeSeriesData(
        statsFilters,
        userTimezone,
        granularity,
    )
    const { greyArea, greyAreaChartParam } = useMemo(
        () => getGreyAreaAndChartParam(statsFilters.period),
        [statsFilters.period],
    )
    const automationRateTimeSeriesData = useMemo(
        () =>
            formatAutomationRateTimeSeriesData(
                timeSeries,
                granularity,
                greyArea,
            ),
        [granularity, greyArea, timeSeries],
    )

    return (
        <ChartCard
            {...getGreyAreaHint(greyArea)}
            title={AUTOMATION_RATE_LABEL}
            hint={AUTOMATION_RATE_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
        >
            <LineChart
                isCurvedLine={false}
                isLoading={isFetching}
                data={automationRateTimeSeriesData}
                greyArea={greyAreaChartParam}
                hasBackground
                _displayLegacyTooltip
                yAxisBeginAtZero
                renderXTickLabel={renderAutomateXTickLabel}
                _renderLegacyTooltipLabel={renderAutomateTooltipLabel(true)}
                renderYTickLabel={automatePercentLabel}
            />
        </ChartCard>
    )
}
