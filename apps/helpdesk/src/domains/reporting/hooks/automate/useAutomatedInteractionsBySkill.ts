import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { aiAgentInteractionsBySkillQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

const SKILL_LABELS = {
    [AIAgentSkills.AIAgentSupport]: 'Support',
    [AIAgentSkills.AIAgentSales]: 'Shopping assistant',
}

export const useAutomatedInteractionsBySkill = (
    filters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentInteractionsBySkillQueryFactory(filters, timezone)

    const result = useMetricPerDimensionV2(query, undefined, undefined, true)

    const chartData =
        result.data?.allValues?.map((item) => ({
            name:
                SKILL_LABELS[item.dimension as AIAgentSkills] ||
                String(item.dimension),
            value: item.value || 0,
        })) ?? []

    return {
        data: chartData,
        isLoading: result.isFetching,
        isError: result.isError,
    }
}

export const fetchAutomatedInteractionsBySkill = async (
    filters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentInteractionsBySkillQueryFactory(filters, timezone)

    const result = await fetchMetricPerDimensionV2(query, undefined, undefined)

    const chartData =
        result.data?.allValues?.map((item) => ({
            name:
                SKILL_LABELS[item.dimension as AIAgentSkills] ||
                String(item.dimension),
            value: item.value || 0,
        })) ?? []

    return {
        data: chartData,
        isFetching: false,
        isError: result.isError,
    }
}
