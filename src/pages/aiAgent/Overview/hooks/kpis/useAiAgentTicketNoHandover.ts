import { useMemo } from 'react'

import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { AutomationDatasetMeasure } from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import { automationDatasetQueryFactory } from 'models/reporting/queryFactories/automate_v2/metrics'
import { FilterKey, StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

/**
 * AI Agent ticket that have 0 human interaction.
 */
export const useAiAgentTicketNoHandover = (
    filters: StatsFilters,
    timezone: string,
) => {
    const statsFiltersWithAiAgent = useMemo(
        () => ({
            [FilterKey.Period]: filters.period,
        }),
        [filters],
    )

    const aiAgentAutomatedInteractionsData = useMultipleMetricsTrends(
        automationDatasetQueryFactory(statsFiltersWithAiAgent, timezone),
        automationDatasetQueryFactory(
            {
                ...statsFiltersWithAiAgent,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

    const aiAgentAutomatedInteractions =
        aiAgentAutomatedInteractionsData.data?.[
            AutomationDatasetMeasure.AutomatedInteractions
        ]

    return {
        data: aiAgentAutomatedInteractions,
        isFetching: aiAgentAutomatedInteractionsData.isFetching,
        isError: aiAgentAutomatedInteractionsData.isError,
    }
}
