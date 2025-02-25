import React, { useMemo } from 'react'

import moment from 'moment'

import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { useAutomateMetricsTimeSeries } from 'hooks/reporting/automate/useAutomationDataset'
import { useNewAutomateFilters } from 'hooks/reporting/automate/useNewAutomateFilters'
import { calculateGreyArea } from 'hooks/reporting/automate/utils'
import useAppSelector from 'hooks/useAppSelector'
import { FilterKey } from 'models/stat/types'
import { AUTOMATED_INTERACTION_TOOLTIP } from 'pages/automate/automate-metrics/constants'
import {
    getGreyAreaHint,
    getTimeSeriesFormattedData,
} from 'pages/stats/automate/overview/utils'
import ChartCard from 'pages/stats/ChartCard'
import { default as LineChart } from 'pages/stats/common/components/charts/LineChart/LineChart'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { SHORT_FORMAT } from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import { getStatsFiltersWithLogicalOperators } from 'state/stats/selectors'

const AUTOMATED_INTERACTIONS_LABEL = 'AI Agent'

export const AUTOMATED_INTERACTIONS_OVER_TIME_CHART_TITLE =
    'Automated interactions over time'

export function AutomatedInteractionsOverTimeChart({
    chartId,
    dashboard,
}: DashboardChartProps) {
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)

    const aiAgentUserId = useAIAgentUserId()

    const statsFiltersWithAiAgent = useMemo(
        () => ({
            ...statsFilters,
            [FilterKey.Agents]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [Number(aiAgentUserId)],
            },
        }),
        [aiAgentUserId, statsFilters],
    )

    const { userTimezone, granularity } = useNewAutomateFilters()
    const timeseries = useAutomateMetricsTimeSeries(
        statsFiltersWithAiAgent,
        userTimezone,
        granularity,
    )

    const greyArea = useMemo(
        () =>
            calculateGreyArea(
                moment(statsFilters.period.start_datetime),
                moment(statsFilters.period.end_datetime),
            ),
        [statsFilters.period.end_datetime, statsFilters.period.start_datetime],
    )

    const greyAreaChartParam = useMemo(
        () =>
            greyArea
                ? {
                      start: greyArea.from.format(SHORT_FORMAT),
                      end: greyArea.to.format(SHORT_FORMAT),
                  }
                : undefined,
        [greyArea],
    )

    const { automatedInteractionByEventTypesTimeSeriesData } =
        getTimeSeriesFormattedData(timeseries, granularity, greyArea)

    const data = automatedInteractionByEventTypesTimeSeriesData.find(
        (item) => item.label === AUTOMATED_INTERACTIONS_LABEL,
    )

    return (
        <ChartCard
            title={AUTOMATED_INTERACTIONS_OVER_TIME_CHART_TITLE}
            hint={{ title: AUTOMATED_INTERACTION_TOOLTIP }}
            {...getGreyAreaHint(greyArea)}
            chartId={chartId}
            dashboard={dashboard}
        >
            {data && (
                <LineChart
                    isCurvedLine={false}
                    yAxisBeginAtZero
                    data={[data]}
                    _displayLegacyTooltip
                    greyArea={greyAreaChartParam}
                />
            )}
        </ChartCard>
    )
}
