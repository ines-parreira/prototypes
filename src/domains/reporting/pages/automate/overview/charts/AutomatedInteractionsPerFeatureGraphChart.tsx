import React, { useMemo } from 'react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import {
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'domains/reporting/hooks/automate/useAutomationDataset'
import {
    getAutomateColorsForEventType,
    getGreyAreaAndChartParam,
    renderAutomateTooltipLabel,
    renderAutomateXTickLabel,
} from 'domains/reporting/hooks/automate/utils'
import css from 'domains/reporting/pages/automate/overview/AutomateOverview.less'
import {
    getGreyAreaHint,
    getTimeSeriesFormattedData,
} from 'domains/reporting/pages/automate/overview/utils'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { LineChart } from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL } from 'domains/reporting/pages/self-service/constants'
import { AUTOMATED_INTERACTION_TOOLTIP } from 'pages/automate/automate-metrics/constants'

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
