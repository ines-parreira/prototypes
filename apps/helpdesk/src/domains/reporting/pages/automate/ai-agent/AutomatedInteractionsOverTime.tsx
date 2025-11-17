import { useMemo } from 'react'

import type { GreyArea } from 'domains/reporting/hooks/automate/types'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomateMetricsTimeSeries } from 'domains/reporting/hooks/automate/useAutomationDataset'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { getTimeSeriesFormattedData } from 'domains/reporting/pages/automate/overview/utils'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { SHORT_FORMAT } from 'domains/reporting/pages/common/utils'

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
