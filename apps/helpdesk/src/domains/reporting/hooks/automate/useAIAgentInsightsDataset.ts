import { useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import {
    useAiAgentTicketCountFromTicketCustomFieldsPerIntent,
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
    enrichWithSuccessRate,
    enrichWithSuccessRateUpliftOpportunity,
    filterMetricDataByIntentLevel,
    transformIntentName,
} from 'domains/reporting/hooks/automate/utils'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import useStatsMetricTrend from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    TicketDimension,
    TicketMeasure,
} from 'domains/reporting/models/cubes/TicketCube'
import type { TicketCustomFieldsCube } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
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
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { allAgentsAutomatedInteractionsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { coverageRateQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentCoverageRate'
import { averageAiAgentCsatQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentCsat'
import { aiAgentAllAgentsSuccessRateTrendQueryFactory } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getStatsStoreIntegrations } from 'domains/reporting/state/stats/selectors'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import type { OrderDirection } from 'models/api/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import type { IntentMetrics } from 'pages/aiAgent/insights/IntentTableWidget/types'
import { IntentTableColumn } from 'pages/aiAgent/insights/IntentTableWidget/types'
import { useAiAgentTicketNoHandover } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover'

export const useAIAgentMetrics = (
    filters: StatsFilters,
    timezone: string,
    shopName: string,
    aiAgentUserId: number,
): Record<any, MetricTrend> => {
    const { value: isNewScreens, isLoading: isFlagLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens)
    const useV2 = !isFlagLoading && !!isNewScreens
    const useV1 = !isFlagLoading && !isNewScreens

    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)

    const storeIntegrations = useAppSelector(getStatsStoreIntegrations)
    const numericStoreIds = storeIntegrations
        .filter((s) => s.name === shopName)
        .map((s) => s.id)
    const storeFilter = numericStoreIds.length
        ? { storeIntegrations: withLogicalOperator(numericStoreIds) }
        : {}
    const filtersWithStore = { ...filters, ...storeFilter }

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

    // V1 path
    const aiAgentNoHandoverData = useAiAgentTicketNoHandover(
        statsFiltersWithAiAgent,
        timezone,
        integrationIds,
        useV1,
    )
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
        undefined,
        undefined,
        useV1,
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
        undefined,
        undefined,
        useV1,
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
        undefined,
        undefined,
        useV1,
    )

    // V2 path
    const v2CoverageRate = useStatsMetricTrend(
        coverageRateQueryV2Factory({ filters: filtersWithStore, timezone }),
        coverageRateQueryV2Factory({
            filters: {
                ...filtersWithStore,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
        useV2,
    )

    const v2AutomatedInteractions = useStatsMetricTrend(
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: filtersWithStore,
            timezone,
        }),
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: {
                ...filtersWithStore,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
        useV2,
    )

    const v2SuccessRate = useStatsMetricTrend(
        aiAgentAllAgentsSuccessRateTrendQueryFactory({
            filters: filtersWithStore,
            timezone,
        }),
        aiAgentAllAgentsSuccessRateTrendQueryFactory({
            filters: {
                ...filtersWithStore,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
        useV2,
    )

    const v2Csat = useStatsMetricTrend(
        averageAiAgentCsatQueryV2Factory({
            filters: filtersWithStore,
            timezone,
        }),
        averageAiAgentCsatQueryV2Factory({
            filters: {
                ...filtersWithStore,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
        useV2,
    )

    // V1 derived values
    const aiAgentTickets = aiAgentTicketsData.data?.[TicketMeasure.TicketCount]
    const aiAgentAutomatedInteractions =
        aiAgentNoHandoverData.data?.[
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        ]
    const aiAgentCustomerSatisfaction =
        customerSatisfactionAiAgentData.data?.[
            TicketSatisfactionSurveyMeasure.AvgSurveyScore
        ]
    const allTickets = allCreatedTickets.data?.[TicketMeasure.TicketCount]
    const isAiAgentAutomatedInteractionsFetching =
        aiAgentNoHandoverData.isFetching
    const isAiAgentAutomatedInteractionsError = aiAgentNoHandoverData.isError

    return {
        coverageTrend: useV2
            ? {
                  isFetching: isFlagLoading || v2CoverageRate.isFetching,
                  isError: v2CoverageRate.isError,
                  data: v2CoverageRate.data,
              }
            : getAiAgentCoverageRate({
                  isFetching:
                      isFlagLoading ||
                      aiAgentTicketsData.isFetching ||
                      allCreatedTickets.isFetching,
                  isError:
                      aiAgentTicketsData.isError || allCreatedTickets.isError,
                  aiAgentTickets,
                  allTickets,
              }),
        aiAgentAutomatedInteractionTrend: useV2
            ? {
                  isFetching:
                      isFlagLoading || v2AutomatedInteractions.isFetching,
                  isError: v2AutomatedInteractions.isError,
                  data: v2AutomatedInteractions.data,
              }
            : {
                  isFetching:
                      isFlagLoading || isAiAgentAutomatedInteractionsFetching,
                  isError: isAiAgentAutomatedInteractionsError,
                  data: aiAgentAutomatedInteractions,
              },
        aiAgentSuccessRate: useV2
            ? {
                  isFetching: isFlagLoading || v2SuccessRate.isFetching,
                  isError: v2SuccessRate.isError,
                  data: v2SuccessRate.data,
              }
            : getAiAgentSuccessRate({
                  isFetching:
                      isFlagLoading ||
                      isAiAgentAutomatedInteractionsFetching ||
                      aiAgentTicketsData.isFetching,
                  isError:
                      isAiAgentAutomatedInteractionsError ||
                      aiAgentTicketsData.isError,
                  aiAgentAutomatedInteractions,
                  aiAgentTickets,
              }),
        aiAgentCSAT: useV2
            ? {
                  isFetching: isFlagLoading || v2Csat.isFetching,
                  isError: v2Csat.isError,
                  data: v2Csat.data,
              }
            : {
                  isFetching:
                      isFlagLoading ||
                      customerSatisfactionAiAgentData.isFetching,
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
            aiAgentTicketsNotAutomatedGroupedByIntent as MetricWithDecile<
                string,
                TicketCustomFieldsCube
            >,
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
            aiAgentAutomatedTicketsGroupedByIntent as MetricWithDecile<
                string,
                TicketCustomFieldsCube
            >,
            ticketsPerIntent as MetricWithDecile<
                string,
                TicketCustomFieldsCube
            >,
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

    return {
        data: convertedArray,
        isFetching: isFetching,
    }
}
