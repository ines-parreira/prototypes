import React, { useMemo } from 'react'

import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import {
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'hooks/reporting/automate/useAutomationDataset'
import {
    getAutomateColorsForEventType,
    getGreyAreaAndChartParam,
    renderAutomateTooltipLabel,
    renderAutomateXTickLabel,
} from 'hooks/reporting/automate/utils'
import { AUTOMATED_INTERACTION_TOOLTIP } from 'pages/automate/automate-metrics/constants'
import css from 'pages/stats/automate/overview/AutomateOverview.less'
import {
    getGreyAreaHint,
    getTimeSeriesFormattedData,
} from 'pages/stats/automate/overview/utils'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { LineChart } from 'pages/stats/common/components/charts/LineChart/LineChart'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL } from 'pages/stats/self-service/constants'

export const AutomatedInteractionsPerFeatureGraphChart = ({
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
    const { automatedInteractionByEventTypesTimeSeriesData } = useMemo(
        () => getTimeSeriesFormattedData(timeseries, granularity, greyArea),
        [granularity, greyArea, timeseries],
    )

    const colorsForInteractionsByEventType = useMemo(() => {
        return automatedInteractionByEventTypesTimeSeriesData.map((data) =>
            getAutomateColorsForEventType(data.label),
        )
    }, [automatedInteractionByEventTypesTimeSeriesData])
    const hasActivity =
        !automatedInteractionTrend.isFetching &&
        automatedInteractionTrend.data?.value

    return (
        <ChartCard
            {...getGreyAreaHint(greyArea)}
            title={AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL}
            hint={AUTOMATED_INTERACTION_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
        >
            <LineChart
                isCurvedLine={false}
                yAxisBeginAtZero
                isLoading={isTimeSeriesFetching}
                data={automatedInteractionByEventTypesTimeSeriesData}
                greyArea={greyAreaChartParam}
                _displayLegacyTooltip
                displayLegend
                toggleLegend
                legendOnLeft
                _renderLegacyTooltipLabel={renderAutomateTooltipLabel()}
                customColors={colorsForInteractionsByEventType}
                renderXTickLabel={renderAutomateXTickLabel}
                yAxisScale={hasActivity ? {} : { min: 0, max: 750 }}
                wrapperclassNames={css.chartWrapper}
            />
        </ChartCard>
    )
}
