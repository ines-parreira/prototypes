import { useMemo } from 'react'

import {
    useAiAgentAutomatedInteractionsCountTrends,
    useAiAgentAutomatedTicketsCountTrends,
    useAIAgentResourcePerTicket,
    useAiAgentTicketCountFromTicketCustomFieldsPerIntent,
    useAiAgentTickets,
    useAIAgentTicketsWithIntent,
    useCustomerSatisfactionMetricPerIntentLevel,
    useGetTicketIntentsForTicketIds,
    useTotalAiAgentTicketsByCustomField,
} from 'domains/reporting/hooks/automate/aiAgentMetrics'
import {
    getAiAgentCoverageRate,
    getAiAgentSuccessRate,
} from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import { CUSTOM_FIELD_AI_AGENT_HANDOVER } from 'domains/reporting/hooks/automate/types'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    calculateAiAgentKnowledgeResourcePerIntent,
    enrichWithSuccessRate,
    enrichWithSuccessRateUpliftOpportunity,
    filterMetricDataByIntentLevel,
    transformIntentName,
} from 'domains/reporting/hooks/automate/utils'
import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import { AutomatedTicketsMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomatedTicketsCube'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import {
    TicketDimension,
    TicketMeasure,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import {
    aiAgentTouchedTicketTotalCountQueryFactory,
    allTicketsForAiAgentTotalCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/metrics'
import { AI_AGENT_TICKETS_CHANNELS } from 'domains/reporting/models/queryFactories/ai-agent-insights/utils'
import { customerSatisfactionForAIAgentTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { FilterKey, StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { OrderDirection } from 'models/api/types'
import useIsSingleStore from 'pages/aiAgent/hooks/useIsSingleStore'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import {
    IntentMetrics,
    IntentTableColumn,
} from 'pages/aiAgent/insights/IntentTableWidget/types'

export const useAIAgentMetrics = (
    filters: StatsFilters,
    timezone: string,
    shopName: string,
    aiAgentUserId: number,
): Record<any, MetricTrend> => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)

    const statsFiltersWithAiAgent = useMemo(
        () => ({
            [FilterKey.Period]: filters.period,
            [FilterKey.Agents]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [aiAgentUserId],
            },
            [FilterKey.Channels]: {
                values: AI_AGENT_TICKETS_CHANNELS,
                operator: LogicalOperatorEnum.ONE_OF,
            },
        }),
        [aiAgentUserId, filters],
    )

    const isSingleStore = useIsSingleStore()

    const aiAgentAutomatedInteractionsDataForMultiStore =
        useAiAgentAutomatedTicketsCountTrends({
            filters,
            timezone,
            outcomeFieldId: outcomeCustomFieldId,
            intentFieldId: intentCustomFieldId,
            integrationIds,
            enabled: !isSingleStore,
        })

    const aiAgentAutomatedInteractionsDataForSingleStore =
        useAiAgentAutomatedInteractionsCountTrends({
            filters: statsFiltersWithAiAgent,
            timezone,
            enabled: isSingleStore,
        })
    const aiAgentTicketsData = useMultipleMetricsTrends(
        aiAgentTouchedTicketTotalCountQueryFactory({
            filters,
            timezone,
            outcomeFieldId: outcomeCustomFieldId,
            intentFieldId: intentCustomFieldId,
            integrationIds,
        }),
        aiAgentTouchedTicketTotalCountQueryFactory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            outcomeFieldId: outcomeCustomFieldId,
            intentFieldId: intentCustomFieldId,
            integrationIds,
        }),
    )

    const allCreatedTickets = useMultipleMetricsTrends(
        allTicketsForAiAgentTotalCountQueryFactory({
            filters,
            timezone,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
            integrationIds,
        }),
        allTicketsForAiAgentTotalCountQueryFactory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
            integrationIds,
        }),
    )

    const customerSatisfactionAiAgentData = useMultipleMetricsTrends(
        customerSatisfactionForAIAgentTicketsQueryFactory({
            filters: statsFiltersWithAiAgent,
            timezone,
            outcomeFieldId: outcomeCustomFieldId,
            intentFieldId: intentCustomFieldId,
            aiAgentUserId: aiAgentUserId,
            integrationIds,
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
            integrationIds,
        }),
    )

    const aiAgentTickets = aiAgentTicketsData.data?.[TicketMeasure.TicketCount]

    const aiAgentAutomatedInteractions = isSingleStore
        ? aiAgentAutomatedInteractionsDataForSingleStore.data?.[
              AutomationDatasetMeasure.AutomatedInteractions
          ]
        : aiAgentAutomatedInteractionsDataForMultiStore.data?.[
              AutomatedTicketsMeasure.NumAutomatedTickets
          ]

    const aiAgentCustomerSatisfaction =
        customerSatisfactionAiAgentData.data?.[
            TicketSatisfactionSurveyMeasure.AvgSurveyScore
        ]

    const allTickets = allCreatedTickets.data?.[TicketMeasure.TicketCount]

    const isAiAgentAutomatedInteractionsFetching =
        aiAgentAutomatedInteractionsDataForSingleStore.isFetching ||
        aiAgentAutomatedInteractionsDataForMultiStore.isFetching

    const isAiAgentAutomatedInteractionsError =
        aiAgentAutomatedInteractionsDataForSingleStore.isError ||
        aiAgentAutomatedInteractionsDataForMultiStore.isError

    return {
        coverageTrend: getAiAgentCoverageRate({
            isFetching:
                aiAgentTicketsData.isFetching || allCreatedTickets.isFetching,
            isError: aiAgentTicketsData.isError || allCreatedTickets.isError,
            aiAgentTickets,
            allTickets,
        }),
        aiAgentAutomatedInteractionTrend: {
            isFetching: isAiAgentAutomatedInteractionsFetching,
            isError: isAiAgentAutomatedInteractionsError,
            data: aiAgentAutomatedInteractions,
        },
        aiAgentSuccessRate: getAiAgentSuccessRate({
            isFetching:
                isAiAgentAutomatedInteractionsFetching ||
                aiAgentTicketsData.isFetching,
            isError:
                isAiAgentAutomatedInteractionsError ||
                aiAgentTicketsData.isError,
            aiAgentAutomatedInteractions,
            aiAgentTickets,
        }),
        aiAgentCSAT: {
            isFetching: customerSatisfactionAiAgentData.isFetching,
            isError: customerSatisfactionAiAgentData.isError,
            data: aiAgentCustomerSatisfaction,
        },
    }
}

// success rate uplift opportunity: #tickets not automated by AI AGENT per intent / #AI Agent Tickets
export const useSuccessRateUpliftOpportunityPerIntent = ({
    filters,
    timezone,
    sorting,
    intentId,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intentId?: string
    integrationIds?: string[]
}) => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentTickets = useTotalAiAgentTicketsByCustomField(
        filters,
        timezone,
        intentCustomFieldId,
        outcomeCustomFieldId,
        sorting,
        integrationIds,
    )

    const aiAgentTicketsNotAutomatedGroupedByIntent =
        useAiAgentTicketCountFromTicketCustomFieldsPerIntent({
            filters,
            timezone,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
            integrationIds: integrationIds,
            sorting,
            intentId,
            outcomeValueToInclude: CUSTOM_FIELD_AI_AGENT_HANDOVER,
        })

    const enrichedTickets = useMemo(() => {
        if (!aiAgentTicketsNotAutomatedGroupedByIntent || !aiAgentTickets) {
            return []
        }

        const totalTicketCount = String(aiAgentTickets.data?.value)

        return enrichWithSuccessRateUpliftOpportunity(
            aiAgentTicketsNotAutomatedGroupedByIntent,
            totalTicketCount,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            sorting,
        )
    }, [aiAgentTickets, aiAgentTicketsNotAutomatedGroupedByIntent, sorting])

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
    integrationIds?: string[],
) => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentTicketsGroupedByIntent =
        useAiAgentTicketCountFromTicketCustomFieldsPerIntent({
            filters,
            timezone,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
            integrationIds: integrationIds,
            sorting,
            intentId,
        })

    return aiAgentTicketsGroupedByIntent
}

// SUCCESS RATE: # of Automated AI Agent tickets per intent / AI Agent Tickets per intent
export const useSuccessRatePerIntent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    intentId?: string,
    integrationIds?: string[],
) => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const ticketsPerIntent = useAIAgentTicketsPerIntent(
        filters,
        timezone,
        sorting,
        intentId,
        integrationIds,
    )

    const aiAgentAutomatedTicketsGroupedByIntent =
        useAiAgentTicketCountFromTicketCustomFieldsPerIntent({
            filters,
            timezone,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
            integrationIds: integrationIds,
            sorting,
            intentId,
            outcomeValuesToExclude: [CUSTOM_FIELD_AI_AGENT_HANDOVER],
        })

    const enrichedTickets = useMemo(() => {
        if (!aiAgentAutomatedTicketsGroupedByIntent || !ticketsPerIntent) {
            return []
        }

        return enrichWithSuccessRate(
            aiAgentAutomatedTicketsGroupedByIntent,
            ticketsPerIntent,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            sorting,
        )
    }, [ticketsPerIntent, aiAgentAutomatedTicketsGroupedByIntent, sorting])

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
    integrationIds?: string[],
) => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentNotAutomatedTicketsData = useAiAgentTickets({
        filters,
        timezone,
        outcomeFieldId: outcomeCustomFieldId,
        intentFieldId: intentCustomFieldId,
        integrationIds,
    })

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
    integrationIds?: string[],
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
        integrationIds,
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
    integrationIds?: string[],
) => {
    const INTENT_LEVEL = intentLevel || 2
    // Fetch all metrics for all intents
    const successRateUpliftOpportunityPerIntent =
        useSuccessRateUpliftOpportunityPerIntent({
            filters,
            timezone,
            sorting,
            intentId,
            integrationIds,
        })

    const successRateUpliftOpportunityPerIntentLevel =
        filterMetricDataByIntentLevel({
            metricData: successRateUpliftOpportunityPerIntent.data,
            level: INTENT_LEVEL,
            intentKey: 'TicketCustomFieldsEnriched.valueString',
            valueKey: 'TicketCustomFieldsEnriched.ticketCount',
            totalKey: 'TicketEnriched.ticketCount',
            resultKey: 'successRateUpliftOpportunity',
            metricFor: IntentTableColumn.SuccessRateUpliftOpportunity,
        })

    const ticketsPerIntent = useAIAgentTicketsPerIntent(
        filters,
        timezone,
        sorting,
        intentId,
        integrationIds,
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
        integrationIds,
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
        integrationIds,
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

    // TODO uncomment when AI Agent Knowledge Resource per intent events are available with all needed data
    // const aiAgentKnowledgeResourcePerIntent =
    //     useAiAgentKnowledgeResourcePerIntent(
    //         filters,
    //         timezone,
    //         sorting,
    //         intentId,
    //         integrationIds,
    //     )
    //
    // const aiAgentKnowledgeResourcePerIntentPerIntentLevel =
    //     filterMetricDataByIntentLevel({
    //         metricData: aiAgentKnowledgeResourcePerIntent.data,
    //         level: INTENT_LEVEL,
    //         intentKey: 'TicketEnriched.customField',
    //         valueKey: 'resources',
    //         resultKey: 'resources',
    //         metricFor: IntentTableColumn.Resources,
    //     })

    return {
        successRateUpliftOpportunityPerIntent: {
            ...successRateUpliftOpportunityPerIntent,
            data: successRateUpliftOpportunityPerIntentLevel,
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
            // ...aiAgentKnowledgeResourcePerIntent,
            // data: aiAgentKnowledgeResourcePerIntentPerIntentLevel,
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
    shopName: string,
    sorting?: OrderDirection,
    intentId?: string,
    intentLevel?: number,
) => {
    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)
    const {
        successRateUpliftOpportunityPerIntent,
        ticketsPerIntent,
        successRatePerIntent,
        customerSatisfactionPerIntent,
        // aiAgentKnowledgeResourcePerIntent,
    } = useFetchAllIntentsMetrics(
        filters,
        timezone,
        sorting,
        intentId,
        intentLevel,
        integrationIds,
    )
    const results: Record<string, IntentMetrics> = {}
    const metrics = [
        {
            data: successRateUpliftOpportunityPerIntent.data || [],
            metricKey: 'successRateUpliftOpportunity',
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
        // {
        //     data: aiAgentKnowledgeResourcePerIntent.data || [],
        //     metricKey: 'resources',
        //     resultKey: 'resources',
        //     itemKey: 'TicketEnriched.customField',
        // },
    ]

    metrics.forEach(({ data, metricKey, resultKey }) =>
        addMetricDataToResults(results, data, metricKey, resultKey),
    )

    // Convert object to array of objects
    const convertedArray = convertResultToTableArrayFormat(results, intentLevel)

    const isFetching =
        successRateUpliftOpportunityPerIntent.isFetching ||
        ticketsPerIntent.isFetching ||
        successRatePerIntent.isFetching ||
        customerSatisfactionPerIntent.isFetching
    // aiAgentKnowledgeResourcePerIntent.isFetching

    return {
        data: convertedArray,
        isFetching: isFetching,
    }
}
