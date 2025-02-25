import React, { useMemo } from 'react'

import {
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'hooks/reporting/automate/useAutomationDataset'
import { useNewAutomateFilters } from 'hooks/reporting/automate/useNewAutomateFilters'
import {
    getGreyAreaAndChartParam,
    renderAutomateTooltipLabel,
    renderAutomateXTickLabel,
} from 'hooks/reporting/automate/utils'
import { AUTOMATED_INTERACTION_TOOLTIP } from 'pages/automate/automate-metrics/constants'
import {
    getGreyAreaHint,
    getTimeSeriesFormattedData,
} from 'pages/stats/automate/overview/utils'
import ChartCard from 'pages/stats/ChartCard'
import { LineChart } from 'pages/stats/common/components/charts/LineChart/LineChart'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import { AUTOMATED_INTERACTIONS_LABEL } from 'pages/stats/self-service/constants'

export const AutomatedInteractionsGraphChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone, granularity } = useNewAutomateFilters()
    const { automatedInteractionTrend } = useAutomateMetricsTrend(
        statsFilters,
        userTimezone,
    )
    const timeseries = useAutomateMetricsTimeSeries(
        statsFilters,
        userTimezone,
        granularity,
    )
    const { isFetching: isTimeSeriesFetching } = timeseries
    const { greyArea, greyAreaChartParam } = useMemo(
        () => getGreyAreaAndChartParam(statsFilters.period),
        [statsFilters.period],
    )

    const { automatedInteractionTimeSeriesData } = useMemo(
        () => getTimeSeriesFormattedData(timeseries, granularity, greyArea),
        [granularity, greyArea, timeseries],
    )
    const hasActivity =
        !automatedInteractionTrend.isFetching &&
        automatedInteractionTrend.data?.value

    return (
        <ChartCard
            {...getGreyAreaHint(greyArea)}
            title={AUTOMATED_INTERACTIONS_LABEL}
            hint={AUTOMATED_INTERACTION_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
        >
            <LineChart
                isCurvedLine={false}
                isLoading={isTimeSeriesFetching}
                data={automatedInteractionTimeSeriesData}
                greyArea={greyAreaChartParam}
                hasBackground
                _displayLegacyTooltip
                _renderLegacyTooltipLabel={renderAutomateTooltipLabel()}
                yAxisBeginAtZero
                renderXTickLabel={renderAutomateXTickLabel}
                yAxisScale={hasActivity ? {} : { min: 0, max: 5000 }}
                renderYTickLabel={(val) => {
                    return parseFloat(val.toString()).toLocaleString()
                }}
            />
        </ChartCard>
    )
}
