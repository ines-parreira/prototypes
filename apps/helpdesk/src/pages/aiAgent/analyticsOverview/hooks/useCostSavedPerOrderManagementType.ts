import {
    fetchStatsMetricPerDimension,
    mapMetricValues,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { automatedInteractionsPerOrderManagementTypeQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

const formatCostSavedData = (
    value: number | null,
    costSavedPerInteraction: number,
) => {
    return value !== null ? value * costSavedPerInteraction : null
}

export const useCostSavedPerOrderManagementType = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = automatedInteractionsPerOrderManagementTypeQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    const automatedInteractions = useStatsMetricPerDimension(query)
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    return mapMetricValues(automatedInteractions, (v) =>
        formatCostSavedData(v, costSavedPerInteraction),
    )
}

export const fetchCostSavedPerOrderManagementType = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
) => {
    const query = automatedInteractionsPerOrderManagementTypeQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    const automatedInteractions = await fetchStatsMetricPerDimension(query)

    return mapMetricValues(automatedInteractions, (v) =>
        formatCostSavedData(v, costSavedPerInteraction),
    )
}
