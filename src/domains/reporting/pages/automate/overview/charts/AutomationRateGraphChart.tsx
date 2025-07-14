import React, { useMemo } from 'react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomationRateTimeSeriesData } from 'domains/reporting/hooks/automate/useAutomationRateTimeSeriesData'
import {
    automatePercentLabel,
    getGreyAreaAndChartParam,
    renderAutomateTooltipLabel,
    renderAutomateXTickLabel,
} from 'domains/reporting/hooks/automate/utils'
import {
    formatAutomationRateTimeSeriesData,
    getGreyAreaHint,
} from 'domains/reporting/pages/automate/overview/utils'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { LineChart } from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AUTOMATION_RATE_LABEL } from 'domains/reporting/pages/self-service/constants'
import { AUTOMATION_RATE_TOOLTIP } from 'pages/automate/automate-metrics/AutomationRateMetric'

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
