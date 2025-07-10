import { useMemo } from 'react'

import { GreyArea } from 'hooks/reporting/automate/types'
import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import { useAutomateMetricsTimeSeries } from 'hooks/reporting/automate/useAutomationDataset'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { FilterKey } from 'models/stat/types'
import { getTimeSeriesFormattedData } from 'pages/stats/automate/overview/utils'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { SHORT_FORMAT } from 'pages/stats/common/utils'

const AUTOMATED_INTERACTIONS_LABEL = 'AI Agent'

export const AutomatedInteractionsOverTime = ({
    aiAgentUserId,
    greyArea,
}: {
    aiAgentUserId: number
    greyArea: GreyArea | null
}) => {
    const { cleanStatsFilters: statsFilters } = useStatsFilters()
    const statsFiltersWithAiAgent = useMemo(
        () => ({
            ...statsFilters,
            [FilterKey.Agents]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [aiAgentUserId],
            },
        }),
        [aiAgentUserId, statsFilters],
    )

    const { userTimezone, granularity } = useAutomateFilters()
    const timeseries = useAutomateMetricsTimeSeries(
        statsFiltersWithAiAgent,
        userTimezone,
        granularity,
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
        data && (
            <LineChart
                isCurvedLine={false}
                yAxisBeginAtZero
                data={[data]}
                _displayLegacyTooltip
                greyArea={greyAreaChartParam}
            />
        )
    )
}
