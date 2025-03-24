import { useMemo } from 'react'

import {
    calculateAiAgentKnowledgeResourcePerIntent,
    enrichWithAutomationOpportunity,
    enrichWithSuccessRate,
    filterMetricDataByIntentLevel,
    transformIntentName,
} from 'hooks/reporting/automate/utils'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { OrderDirection } from 'models/api/types'
import { AutomationDatasetMeasure } from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    AI_AGENT_TICKETS_CHANNELS,
    aiAgentTouchedTicketTotalCountQueryFactory,
    allTicketsForAiAgentTotalCountQueryFactory,
} from 'models/reporting/queryFactories/ai-agent-insights/metrics'
import { aiAgentAutomatedInteractionsQueryFactory } from 'models/reporting/queryFactories/automate_v2/metrics'
import { customerSatisfactionForAIAgentTicketsQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import { ReportingFilterOperator } from 'models/reporting/types'
import { FilterKey, StatsFilters } from 'models/stat/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import {
    IntentMetrics,
    IntentTableColumn,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { getPreviousPeriod } from 'utils/reporting'

import {
    useAIAgentResourcePerTicket,
    useAiAgentTicketCountPerIntent,
    useAiAgentTickets,
    useAIAgentTicketsWithIntent,
    useCustomerSatisfactionMetricPerIntentLevel,
    useGetTicketIntentsForTicketIds,
    useTotalAiAgentTicketsByCustomField,
} from './aiAgentMetrics'
import {
    getAiAgentCoverageRate,
    getAiAgentSuccessRate,
} from './automateStatsCalculatedTrends'
import { CUSTOM_FIELD_AI_AGENT_HANDOVER } from './types'
import { useAIAgentUserId } from './useAIAgentUserId'

export const useAIAgentMetrics = (
    filters: StatsFilters,
    timezone: string,
): Record<any, MetricTrend> => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentUserId = useAIAgentUserId()

    const statsFiltersWithAiAgent = useMemo(
        () => ({
            [FilterKey.Period]: filters.period,
            [FilterKey.Agents]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [Number(aiAgentUserId)],
            },
            [FilterKey.Channels]: {
                values: AI_AGENT_TICKETS_CHANNELS,
                operator: LogicalOperatorEnum.ONE_OF,
            },
        }),
        [aiAgentUserId, filters],
    )

    const aiAgentAutomatedInteractionsData = useMultipleMetricsTrends(
        aiAgentAutomatedInteractionsQueryFactory(
            statsFiltersWithAiAgent,
            timezone,
        ),
        aiAgentAutomatedInteractionsQueryFactory(
            {
                ...statsFiltersWithAiAgent,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

    const aiAgentTicketsData = useMultipleMetricsTrends(
        aiAgentTouchedTicketTotalCountQueryFactory({
            filters,
            timezone,
            outcomeFieldId: outcomeCustomFieldId,
            intentFieldId: intentCustomFieldId,
        }),
        aiAgentTouchedTicketTotalCountQueryFactory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            outcomeFieldId: outcomeCustomFieldId,
            intentFieldId: intentCustomFieldId,
        }),
    )

    const allCreatedTickets = useMultipleMetricsTrends(
        allTicketsForAiAgentTotalCountQueryFactory({
            filters,
            timezone,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
        }),
        allTicketsForAiAgentTotalCountQueryFactory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
        }),
    )

    const customerSatisfactionAiAgentData = useMultipleMetricsTrends(
        customerSatisfactionForAIAgentTicketsQueryFactory({
            filters: statsFiltersWithAiAgent,
            timezone,
            outcomeFieldId: outcomeCustomFieldId,
            intentFieldId: intentCustomFieldId,
            aiAgentUserId: aiAgentUserId,
        }),
        customerSatisfactionForAIAgentTicketsQueryFactory({
            filters: {
                ...statsFiltersWithAiAgent,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
            outcomeFieldId: outcomeCustomFieldId,
            intentFieldId: intentCustomFieldId,
            aiAgentUserId: aiAgentUserId,
        }),
    )

    const aiAgentTickets = aiAgentTicketsData.data?.[TicketMeasure.TicketCount]

    const aiAgentAutomatedInteractions =
        aiAgentAutomatedInteractionsData.data?.[
            AutomationDatasetMeasure.AutomatedInteractions
        ]

    const aiAgentCustomerSatisfaction =
        customerSatisfactionAiAgentData.data?.[
            TicketSatisfactionSurveyMeasure.AvgSurveyScore
        ]

    const allTickets = allCreatedTickets.data?.[TicketMeasure.TicketCount]

    const isFetching =
        aiAgentAutomatedInteractionsData.isFetching ||
        aiAgentTicketsData.isFetching ||
        customerSatisfactionAiAgentData.isFetching ||
        allCreatedTickets.isFetching

    const isError =
        aiAgentAutomatedInteractionsData.isError ||
        aiAgentTicketsData.isError ||
        customerSatisfactionAiAgentData.isError ||
        allCreatedTickets.isError

    return {
        coverageTrend: getAiAgentCoverageRate({
            isFetching,
            isError,
            aiAgentTickets,
            allTickets,
        }),
        aiAgentAutomatedInteractionTrend: {
            isFetching,
            isError,
            data: aiAgentAutomatedInteractions,
        },
        aiAgentSuccessRate: getAiAgentSuccessRate({
            isFetching,
            isError,
            aiAgentAutomatedInteractions,
            aiAgentTickets,
        }),
        aiAgentCSAT: {
            isFetching,
            isError,
            data: aiAgentCustomerSatisfaction,
        },
    }
}

// AUTOMATION OPPORTUNITY: #tickets not automated by AI AGENT per intent / #AI Agent Tickets
export const useAutomationOpportunityPerIntent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    intentId?: string,
) => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentTickets = useTotalAiAgentTicketsByCustomField(
        filters,
        timezone,
        intentCustomFieldId,
        outcomeCustomFieldId,
        sorting,
    )

    const aiAgentNotAutomatedTicketsData = useAiAgentTickets(
        filters,
        timezone,
        outcomeCustomFieldId,
        intentCustomFieldId,
        ReportingFilterOperator.Contains,
        CUSTOM_FIELD_AI_AGENT_HANDOVER,
        sorting,
    )

    const ticketIds = aiAgentNotAutomatedTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => typeof id === 'string')

    const aiAgentTicketsNotAutomatedGroupedByIntent =
        useAiAgentTicketCountPerIntent({
            filters,
            timezone,
            intentFieldId: intentCustomFieldId,
            ticketIds,
            sorting,
            intentId,
        })

    const enrichedTickets = useMemo(() => {
        if (
            !aiAgentTicketsNotAutomatedGroupedByIntent ||
            !aiAgentTickets ||
            !ticketIds ||
            ticketIds?.length === 0
        ) {
            return []
        }

        const totalTicketCount = String(aiAgentTickets.data?.value)

        return enrichWithAutomationOpportunity(
            aiAgentTicketsNotAutomatedGroupedByIntent,
            totalTicketCount,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            sorting,
        )
    }, [
        aiAgentTickets,
        aiAgentTicketsNotAutomatedGroupedByIntent,
        sorting,
        ticketIds,
    ])

    return {
        isError:
            aiAgentTicketsNotAutomatedGroupedByIntent?.isError ||
            aiAgentTickets.isError,
        isFetching:
            aiAgentTicketsNotAutomatedGroupedByIntent?.isFetching ||
            aiAgentTickets.isFetching,
        data: enrichedTickets,
    }
}

// AI AGENT TICKETS
export const useAIAgentTicketsPerIntent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    intentId?: string,
) => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentTicketsData = useAiAgentTickets(
        filters,
        timezone,
        outcomeCustomFieldId,
        intentCustomFieldId,
    )

    const ticketIds = aiAgentTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => typeof id === 'string')

    const aiAgentTicketsGroupedByIntent1 = useAiAgentTicketCountPerIntent({
        filters,
        timezone,
        intentFieldId: intentCustomFieldId,
        ticketIds,
        sorting,
        intentId,
    })

    return aiAgentTicketsGroupedByIntent1
}

// SUCCESS RATE: # of Automated AI Agent tickets per intent / AI Agent Tickets per intent
export const useSuccessRatePerIntent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    intentId?: string,
) => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentAutomatedTicketsData = useAiAgentTickets(
        filters,
        timezone,
        outcomeCustomFieldId,
        intentCustomFieldId,
        ReportingFilterOperator.NotContains,
        CUSTOM_FIELD_AI_AGENT_HANDOVER,
        sorting,
    )

    const ticketsPerIntent = useAIAgentTicketsPerIntent(
        filters,
        timezone,
        sorting,
        intentId,
    )

    const automatedTicketIds = useMemo(() => {
        return (
            aiAgentAutomatedTicketsData.data?.allData
                .map((item) => item[TicketDimension.TicketId])
                .filter((id): id is string => typeof id === 'string') || []
        )
    }, [aiAgentAutomatedTicketsData])

    const aiAgentAutomatedTicketsGroupedByIntent =
        useAiAgentTicketCountPerIntent({
            filters,
            timezone,
            intentFieldId: intentCustomFieldId,
            ticketIds: automatedTicketIds,
            sorting,
            intentId,
        })

    const enrichedTickets = useMemo(() => {
        if (
            !aiAgentAutomatedTicketsGroupedByIntent ||
            !ticketsPerIntent ||
            !automatedTicketIds ||
            automatedTicketIds.length === 0
        ) {
            return []
        }

        return enrichWithSuccessRate(
            aiAgentAutomatedTicketsGroupedByIntent,
            ticketsPerIntent,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            sorting,
        )
    }, [
        ticketsPerIntent,
        aiAgentAutomatedTicketsGroupedByIntent,
        sorting,
        automatedTicketIds,
    ])

    return {
        isError:
            ticketsPerIntent.isError ||
            aiAgentAutomatedTicketsGroupedByIntent.isError,
        isFetching:
            ticketsPerIntent.isFetching ||
            aiAgentAutomatedTicketsGroupedByIntent.isFetching,
        data: enrichedTickets,
    }
}

// AI AGENT Recommended resources per intent
export const useAiAgentKnowledgeResourcePerIntent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    intentId?: string,
) => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentNotAutomatedTicketsData = useAiAgentTickets(
        filters,
        timezone,
        outcomeCustomFieldId,
        intentCustomFieldId,
    )

    const aiAgentTicketIds = aiAgentNotAutomatedTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => typeof id === 'string')

    const aiAgentTicketsWithIntent = useAIAgentTicketsWithIntent(
        filters,
        timezone,
        intentCustomFieldId,
        aiAgentTicketIds,
        sorting,
        intentId,
    )

    const aiAgentTicketsWithIntentData =
        aiAgentTicketsWithIntent.data?.allData.map((item) => {
            // value is in format 111::L1::L2::L3, remove first part 111:: and leave only L1::L2::L3
            const intent =
                item[TicketDimension.CustomField]
                    ?.split('::')
                    .slice(1)
                    .join('::') ?? null
            return {
                [TicketDimension.TicketId]: item[TicketDimension.TicketId],
                [TicketDimension.CustomField]: intent,
            }
        })

    const ticketIds =
        (aiAgentTicketsWithIntentData &&
            aiAgentTicketsWithIntentData
                .map((item) => item[TicketDimension.TicketId])
                .filter((id): id is string => typeof id === 'string')) ||
        []

    const resourcePerTicketId = useAIAgentResourcePerTicket(
        filters,
        timezone,
        ticketIds,
        sorting,
        !!aiAgentTicketsWithIntentData,
    )

    const aiAgentKnowledgeResourcePerIntent =
        calculateAiAgentKnowledgeResourcePerIntent(
            aiAgentTicketsWithIntentData || [],
            resourcePerTicketId.data?.allData || [],
        )

    return {
        isError:
            aiAgentTicketsWithIntent.isError || resourcePerTicketId.isError,
        isFetching:
            aiAgentTicketsWithIntent.isFetching ||
            resourcePerTicketId.isFetching,
        data: aiAgentKnowledgeResourcePerIntent,
    }
}

export const useCustomerSatisfactionPerIntent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    intentId?: string,
) => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentUserId = useAIAgentUserId()

    const csatPerIntent = useCustomerSatisfactionMetricPerIntentLevel(
        filters,
        timezone,
        sorting,
        aiAgentUserId,
        intentCustomFieldId,
        outcomeCustomFieldId,
    )

    let ticketIds = null
    if (csatPerIntent?.data?.allData && csatPerIntent.data.allData.length > 0) {
        ticketIds = csatPerIntent.data.allData
            .map((item) => item[TicketSatisfactionSurveyDimension.TicketId])
            .filter((id): id is string => typeof id === 'string')
    }

    const aiAgentTicketsWithIntent = useGetTicketIntentsForTicketIds(
        timezone,
        intentCustomFieldId,
        sorting,
        ticketIds,
    )

    if (aiAgentTicketsWithIntent.isFetching || csatPerIntent.isFetching) {
        return {
            isError: false,
            isFetching: true,
            data: null,
        }
    }

    let enrichedCsatPerIntentData
    //enrich csatPerIntent with ticket intent
    enrichedCsatPerIntentData = csatPerIntent?.data?.allData.map((item) => {
        const ticketId = item[TicketSatisfactionSurveyDimension.TicketId]
        const ticketIntent = aiAgentTicketsWithIntent?.data?.allData.find(
            (item) => item[TicketDimension.TicketId] === ticketId,
        )?.[TicketCustomFieldsDimension.TicketCustomFieldsValueString]
        return {
            ...item,
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                ticketIntent,
        }
    })

    enrichedCsatPerIntentData = enrichedCsatPerIntentData?.filter(
        (item) =>
            !!item[TicketCustomFieldsDimension.TicketCustomFieldsValueString],
    )

    if (intentId && enrichedCsatPerIntentData) {
        enrichedCsatPerIntentData = enrichedCsatPerIntentData.filter((item) =>
            item[
                TicketCustomFieldsDimension.TicketCustomFieldsValueString
            ]?.startsWith(intentId),
        )
    }

    return {
        isFetching:
            aiAgentTicketsWithIntent.isFetching ||
            aiAgentTicketsWithIntent.isFetching,
        isError:
            aiAgentTicketsWithIntent.isError ||
            aiAgentTicketsWithIntent.isError,
        data: enrichedCsatPerIntentData,
    }
}

export const addMetricDataToResults = (
    results: Record<string, IntentMetrics>,
    metricData: Record<string, string | number | null>[],
    metricKey: string,
    resultKey?: string,
    itemKey: string = 'TicketCustomFieldsEnriched.valueString',
) => {
    if (!metricData) {
        return
    }

    metricData.forEach((item: Record<string, any>) => {
        const intent = item[itemKey] as string
        const resultKeyToUse = resultKey || metricKey
        if (intent) {
            results[intent] = {
                ...results[intent],
                [resultKeyToUse]: item[metricKey],
            }
        }
    })
}

const useFetchAllIntentsMetrics = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    intentId?: string,
    intentLevel?: number,
) => {
    const INTENT_LEVEL = intentLevel || 2
    // Fetch all metrics for all intents
    const automationOpportunityPerIntent = useAutomationOpportunityPerIntent(
        filters,
        timezone,
        sorting,
        intentId,
    )

    const automationOpportunityPerIntentLevel = filterMetricDataByIntentLevel({
        metricData: automationOpportunityPerIntent.data,
        level: INTENT_LEVEL,
        intentKey: 'TicketCustomFieldsEnriched.valueString',
        valueKey: 'TicketCustomFieldsEnriched.ticketCount',
        totalKey: 'TicketEnriched.ticketCount',
        resultKey: 'automationOpportunity',
        metricFor: IntentTableColumn.AutomationOpportunities,
    })

    const ticketsPerIntent = useAIAgentTicketsPerIntent(
        filters,
        timezone,
        sorting,
        intentId,
    )
    const ticketsPerIntentLevel = filterMetricDataByIntentLevel({
        metricData: ticketsPerIntent?.data?.allData || [],
        level: INTENT_LEVEL,
        intentKey: 'TicketCustomFieldsEnriched.valueString',
        valueKey: 'TicketCustomFieldsEnriched.ticketCount',
        resultKey: 'tickets',
        metricFor: IntentTableColumn.Tickets,
    })

    const successRatePerIntent = useSuccessRatePerIntent(
        filters,
        timezone,
        sorting,
        intentId,
    )
    const successRatePerIntentLevel = filterMetricDataByIntentLevel({
        metricData: successRatePerIntent.data,
        level: INTENT_LEVEL,
        intentKey: 'TicketCustomFieldsEnriched.valueString',
        valueKey: 'TicketCustomFieldsEnriched.ticketCount',
        totalKey: 'TicketEnriched.ticketCount',
        resultKey: 'successRate',
        metricFor: IntentTableColumn.SuccessRate,
    })

    const customerSatisfactionPerIntent = useCustomerSatisfactionPerIntent(
        filters,
        timezone,
        sorting,
        intentId,
    )

    const customerSatisfactionPerIntentLevel = filterMetricDataByIntentLevel({
        metricData: customerSatisfactionPerIntent.data || [],
        level: INTENT_LEVEL,
        intentKey: 'TicketCustomFieldsEnriched.valueString',
        valueKey: 'TicketSatisfactionSurveyEnriched.surveyScore',
        totalKey: 'TicketSatisfactionSurveyEnriched.scoredSurveysCount',
        resultKey: 'avgCustomerSatisfaction',
        metricFor: IntentTableColumn.AvgCustomerSatisfaction,
    })

    const aiAgentKnowledgeResourcePerIntent =
        useAiAgentKnowledgeResourcePerIntent(
            filters,
            timezone,
            sorting,
            intentId,
        )

    const aiAgentKnowledgeResourcePerIntentPerIntentLevel =
        filterMetricDataByIntentLevel({
            metricData: aiAgentKnowledgeResourcePerIntent.data,
            level: INTENT_LEVEL,
            intentKey: 'TicketEnriched.customField',
            valueKey: 'resources',
            resultKey: 'resources',
            metricFor: IntentTableColumn.Resources,
        })

    return {
        automationOpportunityPerIntent: {
            ...automationOpportunityPerIntent,
            data: automationOpportunityPerIntentLevel,
        },
        ticketsPerIntent: {
            ...ticketsPerIntent,
            data: ticketsPerIntentLevel,
        },
        successRatePerIntent: {
            ...successRatePerIntent,
            data: successRatePerIntentLevel,
        },
        customerSatisfactionPerIntent: {
            ...customerSatisfactionPerIntent,
            data: customerSatisfactionPerIntentLevel,
        },
        aiAgentKnowledgeResourcePerIntent: {
            ...aiAgentKnowledgeResourcePerIntent,
            data: aiAgentKnowledgeResourcePerIntentPerIntentLevel,
        },
    }
}

export const convertResultToTableArrayFormat = (
    results: Record<string, IntentMetrics>,
    intentLevel?: number,
) => {
    const convertedArray = Object.entries(results).map(
        ([key, value]: [string, IntentMetrics]) => ({
            ...value,
            name: transformIntentName(key, intentLevel),
            id: key,
        }),
    )
    return convertedArray
}

export const useAIAgentInsightsDataset = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    intentId?: string,
    intentLevel?: number,
) => {
    const {
        automationOpportunityPerIntent,
        ticketsPerIntent,
        successRatePerIntent,
        customerSatisfactionPerIntent,
        aiAgentKnowledgeResourcePerIntent,
    } = useFetchAllIntentsMetrics(
        filters,
        timezone,
        sorting,
        intentId,
        intentLevel,
    )
    const results: Record<string, IntentMetrics> = {}
    const metrics = [
        {
            data: automationOpportunityPerIntent.data || [],
            metricKey: 'automationOpportunity',
        },
        {
            data: ticketsPerIntent.data || [],
            metricKey: 'tickets',
            resultKey: 'tickets',
        },
        {
            data: successRatePerIntent.data || [],
            metricKey: 'successRate',
            resultKey: 'automationRate',
        },
        {
            data: customerSatisfactionPerIntent.data || [],
            metricKey: 'avgCustomerSatisfaction',
            resultKey: 'avgCustomerSatisfaction',
        },
        {
            data: aiAgentKnowledgeResourcePerIntent.data || [],
            metricKey: 'resources',
            resultKey: 'resources',
            itemKey: 'TicketEnriched.customField',
        },
    ]

    metrics.forEach(({ data, metricKey, resultKey, itemKey }) =>
        addMetricDataToResults(results, data, metricKey, resultKey, itemKey),
    )

    // Convert object to array of objects
    const convertedArray = convertResultToTableArrayFormat(results, intentLevel)

    const isFetching =
        automationOpportunityPerIntent.isFetching ||
        ticketsPerIntent.isFetching ||
        successRatePerIntent.isFetching ||
        customerSatisfactionPerIntent.isFetching ||
        aiAgentKnowledgeResourcePerIntent.isFetching

    return {
        data: convertedArray,
        isFetching: isFetching,
    }
}
