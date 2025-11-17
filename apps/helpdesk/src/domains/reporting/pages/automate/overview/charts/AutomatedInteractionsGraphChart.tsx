import React, { useMemo } from 'react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import {
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'domains/reporting/hooks/automate/useAutomationDataset'
import {
    getGreyAreaAndChartParam,
    renderAutomateTooltipLabel,
    renderAutomateXTickLabel,
} from 'domains/reporting/hooks/automate/utils'
import {
    getGreyAreaHint,
    getTimeSeriesFormattedData,
} from 'domains/reporting/pages/automate/overview/utils'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { LineChart } from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AUTOMATED_INTERACTIONS_LABEL } from 'domains/reporting/pages/self-service/constants'
import { AUTOMATED_INTERACTION_TOOLTIP } from 'pages/automate/automate-metrics/constants'

export const AutomatedInteractionsGraphChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone, granularity } = useAutomateFilters()
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
