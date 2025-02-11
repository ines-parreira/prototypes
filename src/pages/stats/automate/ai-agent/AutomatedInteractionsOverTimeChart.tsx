import moment from 'moment'
import React, {useMemo} from 'react'

import {useAIAgentUserId} from 'hooks/reporting/automate/useAIAgentUserId'
import {useAutomateMetricsTimeseriesV2} from 'hooks/reporting/automate/useAutomationDatasetV2'
import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import {calculateGreyArea} from 'hooks/reporting/automate/utils'
import useAppSelector from 'hooks/useAppSelector'
import {FilterKey} from 'models/stat/types'
import {AUTOMATED_INTERACTION_TOOLTIP} from 'pages/automate/automate-metrics/AutomatedInteractionsMetric'
import {
    getGreyAreaHint,
    useTimeSeriesFormattedData,
} from 'pages/stats/AutomateOverviewContent'
import ChartCard from 'pages/stats/ChartCard'
import {default as LineChart} from 'pages/stats/common/components/charts/LineChart/LineChart'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {SHORT_FORMAT} from 'pages/stats/common/utils'
import {getStatsFiltersWithLogicalOperators} from 'state/stats/selectors'

const AUTOMATED_INTERACTIONS_LABEL = 'AI Agent'

export function AutomatedInteractionsOverTimeChart() {
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
        [aiAgentUserId, statsFilters]
    )

    const {userTimezone, granularity} = useNewAutomateFilters()
    const timeseries = useAutomateMetricsTimeseriesV2(
        statsFiltersWithAiAgent,
        userTimezone,
        granularity
    )

    const greyArea = useMemo(
        () =>
            calculateGreyArea(
                moment(statsFilters.period.start_datetime),
                moment(statsFilters.period.end_datetime)
            ),
        [statsFilters.period.end_datetime, statsFilters.period.start_datetime]
    )

    const greyAreaChartParam = useMemo(
        () =>
            greyArea
                ? {
                      start: greyArea.from.format(SHORT_FORMAT),
                      end: greyArea.to.format(SHORT_FORMAT),
                  }
                : undefined,
        [greyArea]
    )

    const {automatedInteractionByEventTypesTimeSeriesData} =
        useTimeSeriesFormattedData(timeseries, granularity, greyArea)

    const data = automatedInteractionByEventTypesTimeSeriesData.find(
        (item) => item.label === AUTOMATED_INTERACTIONS_LABEL
    )

    if (!data) return null

    return (
        <ChartCard
            title="Automated interactions over time"
            hint={{title: AUTOMATED_INTERACTION_TOOLTIP}}
            {...getGreyAreaHint(greyArea)}
        >
            <LineChart
                isCurvedLine={false}
                yAxisBeginAtZero
                data={[data]}
                _displayLegacyTooltip
                greyArea={greyAreaChartParam}
            />
        </ChartCard>
    )
}
