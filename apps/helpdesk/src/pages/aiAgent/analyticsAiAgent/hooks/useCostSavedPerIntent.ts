import {
    fetchStatsMetricPerDimension,
    mapMetricValues,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentAutomatedInteractionsPerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useCostSavedPerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentAutomatedInteractionsPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    const automatedInteractions = useStatsMetricPerDimension(query)
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )
    return mapMetricValues(automatedInteractions, (v) =>
        v !== null ? v * costSavedPerInteraction : null,
    )
}

export const fetchCostSavedPerIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
) => {
    const query = aiAgentAutomatedInteractionsPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    const automatedInteractions = await fetchStatsMetricPerDimension(query)
    return mapMetricValues(automatedInteractions, (v) =>
        v !== null ? v * costSavedPerInteraction : null,
    )
}
