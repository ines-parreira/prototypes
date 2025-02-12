import {useMemo} from 'react'

import {AI_MANAGED_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    calculateAiAgentKnowledgeResourcePerIntent,
    enrichWithAutomationOpportunity,
    enrichWithSuccessRate,
    getIntentByLevel,
    transformIntentName,
} from 'hooks/reporting/automate/utils'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {OrderDirection} from 'models/api/types'
import {AutomationDatasetMeasure} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {automationDatasetQueryFactory} from 'models/reporting/queryFactories/automate_v2/metrics'
import {customerSatisfactionMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {ticketsCreatedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {customFieldsTicketTotalCountQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {ReportingFilterOperator} from 'models/reporting/types'
import {FilterKey, StatsFilters} from 'models/stat/types'
import {
    IntentMetrics,
    IntentTableColumn,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {activeParams} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {getPreviousPeriod} from 'utils/reporting'

import {
    useAiAgenTickets,
    useAIAgentResourcePerTicket,
    useAiAgentTicketCountPerIntent,
    useAIAgentTicketsWithIntent,
    useCustomerSatisfactionMetricPerIntentLevel,
    useTotalAiAgentTicketsByCustomField,
} from './aiAgentMetrics'
import {
    getAiAgentCoverageRate,
    getAiAgentSuccessRate,
} from './automateStatsCalculatedTrends'
import {CUSTOM_FIELD_AI_AGENT_HANDOVER} from './types'
import {useAIAgentUserId} from './useAIAgentUserId'

// COVERAGE_RATE: #AI_AGENT_TICKETS / #TICKETS
// AUTOMATED INTERACTIONS: fully automated interactions by AI Agent
// SUCCESS RATE: #AI_AGENT_AUTOMATED_INTERACTIONS / #AI_AGENT_TICKETS
// CSAT: Customer satisfaction score for AI Agent
export const useAIAgentMetrics = (
    filters: StatsFilters,
    timezone: string
): Record<any, MetricTrend> => {
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const customField = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_OUTCOME
    )

    const aiAgentUserId = useAIAgentUserId()

    const statsFiltersWithAiAgent = useMemo(
        () => ({
            [FilterKey.Period]: filters.period,
            [FilterKey.Agents]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [Number(aiAgentUserId)],
            },
            [FilterKey.Channels]: {
                values: ['email'],
                operator: LogicalOperatorEnum.ONE_OF,
            },
        }),
        [aiAgentUserId, filters]
    )

    const aiAgentAutomatedInteractionsData = useMultipleMetricsTrends(
        automationDatasetQueryFactory(statsFiltersWithAiAgent, timezone),
        automationDatasetQueryFactory(
            {
                ...statsFiltersWithAiAgent,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

    const aiAgentTicketsData = useMultipleMetricsTrends(
        customFieldsTicketTotalCountQueryFactory(
            filters,
            timezone,
            String(customField?.id || -1)
        ),
        customFieldsTicketTotalCountQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            String(customField?.id || -1)
        )
    )

    const allCreatedTickets = useMultipleMetricsTrends(
        ticketsCreatedQueryFactory(filters, timezone),
        ticketsCreatedQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

    const customerSatisfactionAiAgentData = useMultipleMetricsTrends(
        customerSatisfactionMetricPerAgentQueryFactory(
            statsFiltersWithAiAgent,
            timezone
        ),
        customerSatisfactionMetricPerAgentQueryFactory(
            {
                ...statsFiltersWithAiAgent,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

    const aiAgentTickets =
        aiAgentTicketsData.data?.[
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        ]

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
    intentId?: string
) => {
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const customFieldOutcome = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_OUTCOME
    )

    const customFieldAiIntent = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_INTENT
    )

    const aiAgentTickets = useTotalAiAgentTicketsByCustomField(
        filters,
        timezone,
        customFieldOutcome
    )

    const aiAgentNotAutomatedTicketsData = useAiAgenTickets(
        filters,
        timezone,
        customFieldOutcome,
        ReportingFilterOperator.Contains,
        CUSTOM_FIELD_AI_AGENT_HANDOVER
    )

    const ticketIds = aiAgentNotAutomatedTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => typeof id === 'string')

    const aiAgentTicketsNotAutomatedGroupedByIntent =
        useAiAgentTicketCountPerIntent(
            filters,
            timezone,
            customFieldAiIntent,
            ticketIds,
            sorting,
            intentId
        )

    const enrichedTickets = useMemo(() => {
        if (!aiAgentTicketsNotAutomatedGroupedByIntent || !aiAgentTickets) {
            return []
        }

        const totalTicketCount = String(aiAgentTickets.data?.value)

        return enrichWithAutomationOpportunity(
            aiAgentTicketsNotAutomatedGroupedByIntent,
            totalTicketCount,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            sorting
        )
    }, [aiAgentTickets, aiAgentTicketsNotAutomatedGroupedByIntent, sorting])

    return {
        isError:
            aiAgentTicketsNotAutomatedGroupedByIntent.isError ||
            aiAgentTickets.isError,
        isFetching:
            aiAgentTicketsNotAutomatedGroupedByIntent.isFetching ||
            aiAgentTickets.isFetching,
        data: enrichedTickets,
    }
}

// AI AGENT TICKETS
export const useAIAgentTicketsPerIntent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    intentId?: string
) => {
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const customFieldOutcome = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_OUTCOME
    )

    const customFieldAiIntent = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_INTENT
    )

    const aiAgentTicketsData = useAiAgenTickets(
        filters,
        timezone,
        customFieldOutcome
    )

    const ticketIds = aiAgentTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => typeof id === 'string')

    const aiAgentTicketsGroupedByIntent = useAiAgentTicketCountPerIntent(
        filters,
        timezone,
        customFieldAiIntent,
        ticketIds,
        sorting,
        intentId
    )

    return aiAgentTicketsGroupedByIntent
}

// SUCCESS RATE: # of Automated AI Agent tickets per intent / AI Agent Tickets per intent
export const useSuccessRatePerIntent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    intentId?: string
) => {
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const customFieldOutcome = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_OUTCOME
    )

    const customFieldAiIntent = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_INTENT
    )

    const aiAgentAutomatedTicketsData = useAiAgenTickets(
        filters,
        timezone,
        customFieldOutcome,
        ReportingFilterOperator.NotContains,
        CUSTOM_FIELD_AI_AGENT_HANDOVER
    )

    const ticketsPerIntent = useAIAgentTicketsPerIntent(
        filters,
        timezone,
        sorting,
        intentId
    )

    const automatedTicketIds =
        aiAgentAutomatedTicketsData.data?.allData
            .map((item) => item[TicketDimension.TicketId])
            .filter((id): id is string => typeof id === 'string') || []

    const aiAgentAutomatedTicketsGroupedByIntent =
        useAiAgentTicketCountPerIntent(
            filters,
            timezone,
            customFieldAiIntent,
            automatedTicketIds,
            sorting,
            intentId
        )

    const enrichedTickets = useMemo(() => {
        if (!aiAgentAutomatedTicketsGroupedByIntent || !ticketsPerIntent) {
            return []
        }

        return enrichWithSuccessRate(
            aiAgentAutomatedTicketsGroupedByIntent,
            ticketsPerIntent,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            sorting
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
    sorting?: OrderDirection
) => {
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const customFieldAiIntent = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_INTENT
    )

    const customFiledId = customFieldAiIntent?.id
        ? String(customFieldAiIntent.id)
        : null

    const aiAgentTicketsWithIntent = useAIAgentTicketsWithIntent(
        filters,
        timezone,
        customFiledId,
        sorting
    )

    const ticketIds =
        aiAgentTicketsWithIntent.data?.allData
            .map((item) => item[TicketDimension.TicketId])
            .filter((id): id is string => typeof id === 'string') || []

    const resourcePerTicketId = useAIAgentResourcePerTicket(
        filters,
        timezone,
        ticketIds,
        undefined,
        !!aiAgentTicketsWithIntent.data?.allData
    )

    const aiAgentKnowledgeResourcePerIntent =
        calculateAiAgentKnowledgeResourcePerIntent(
            aiAgentTicketsWithIntent.data?.allData || [],
            resourcePerTicketId.data?.allData || []
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
    intentId?: string
) => {
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const customFieldAiIntent = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_INTENT
    )

    const aiAgentUserId = useAIAgentUserId()

    const csatPerIntent = useCustomerSatisfactionMetricPerIntentLevel(
        filters,
        timezone,
        customFieldAiIntent,
        sorting,
        intentId,
        aiAgentUserId
    )

    return csatPerIntent
}

export const addMetricDataToResults = (
    results: Record<string, IntentMetrics>,
    metricData: {[p: string]: string | number}[] | any[],
    metricKey: string,
    resultKey?: string
) => {
    if (!metricData) {
        return
    }

    metricData.forEach((item: Record<string, any>) => {
        const intent = item['TicketCustomFieldsEnriched.valueString'] as string
        const resultKeyToUse = resultKey || metricKey
        if (intent) {
            results[intent] = {
                ...results[intent],
                [resultKeyToUse]: item[metricKey],
            }
        }
    })
}

// Filter metric data by intent level
export const filterMetricDataByIntentLevel = ({
    metricData,
    level,
    intentKey,
    valueKey,
    totalKey,
    resultKey,
    metricFor,
}: {
    metricData: Record<string, any>[]
    level: number
    intentKey: string
    valueKey: string
    totalKey?: string
    resultKey: string
    metricFor: IntentTableColumn
}) => {
    const adjustedData: Record<string, {sum: number; length: number}> = {}
    metricData.forEach((item) => {
        const intent = getIntentByLevel(item[intentKey], level)
        if (!adjustedData[intent]) {
            adjustedData[intent] = {
                sum: 0,
                length: 0,
            }
        }

        const total = (totalKey && Number(item[totalKey])) || 0
        const value = (valueKey && Number(item[valueKey])) || 0

        switch (metricFor) {
            case IntentTableColumn.AutomationOpportunities:
                adjustedData[intent].length = total
                adjustedData[intent].sum += value
                break
            case IntentTableColumn.Tickets:
            case IntentTableColumn.Resources:
                adjustedData[intent].sum += value
                break
            case IntentTableColumn.SuccessRate:
                adjustedData[intent].length += total
                adjustedData[intent].sum += value
                break
            case IntentTableColumn.AvgCustomerSatisfaction:
                adjustedData[intent].length += total
                adjustedData[intent].sum += value * total
                break
        }
    })

    // Calculate average for intents
    return Object.keys(adjustedData).map((intent) => {
        switch (metricFor) {
            case IntentTableColumn.AutomationOpportunities:
            case IntentTableColumn.SuccessRate:
            case IntentTableColumn.AvgCustomerSatisfaction:
                return {
                    [intentKey]: intent,
                    [resultKey]:
                        adjustedData[intent].sum / adjustedData[intent].length,
                }
            case IntentTableColumn.Tickets:
            case IntentTableColumn.Resources:
                return {
                    [intentKey]: intent,
                    [resultKey]: adjustedData[intent].sum,
                }
        }
    })
}

const useFetchAllIntentsMetrics = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
) => {
    const INTENT_LEVEL = 2
    // Fetch all metrics for all intents
    const automationOpportunityPerIntent = useAutomationOpportunityPerIntent(
        filters,
        timezone,
        sorting
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
        sorting
    )
    let ticketsPerIntentPerIntentLevel
    if (ticketsPerIntent.data?.allData) {
        ticketsPerIntentPerIntentLevel = filterMetricDataByIntentLevel({
            metricData: ticketsPerIntent.data.allData,
            level: INTENT_LEVEL,
            intentKey: 'TicketCustomFieldsEnriched.valueString',
            valueKey: 'TicketCustomFieldsEnriched.ticketCount',
            resultKey: 'tickets',
            metricFor: IntentTableColumn.Tickets,
        })
    }

    const successRatePerIntent = useSuccessRatePerIntent(
        filters,
        timezone,
        sorting
    )
    const successRatePerIntentPerIntentLevel = filterMetricDataByIntentLevel({
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
        sorting
    )

    let customerSatisfactionPerIntentPerIntentLevel
    if (customerSatisfactionPerIntent.data?.allData) {
        customerSatisfactionPerIntentPerIntentLevel =
            filterMetricDataByIntentLevel({
                metricData: customerSatisfactionPerIntent.data?.allData,
                level: INTENT_LEVEL,
                intentKey: 'TicketCustomFieldsEnriched.valueString',
                valueKey: 'TicketSatisfactionSurveyEnriched.surveyScore',
                totalKey: 'TicketSatisfactionSurveyEnriched.scoredSurveysCount',
                resultKey: 'avgCustomerSatisfaction',
                metricFor: IntentTableColumn.AvgCustomerSatisfaction,
            })
    }

    const aiAgentKnowledgeResourcePerIntent =
        useAiAgentKnowledgeResourcePerIntent(filters, timezone, sorting)

    const aiAgentKnowledgeResourcePerIntentPerIntentLevel =
        filterMetricDataByIntentLevel({
            metricData: aiAgentKnowledgeResourcePerIntent.data,
            level: INTENT_LEVEL,
            intentKey: 'TicketCustomFieldsEnriched.valueString',
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
            data: ticketsPerIntentPerIntentLevel,
        },
        successRatePerIntent: {
            ...successRatePerIntent,
            data: successRatePerIntentPerIntentLevel,
        },
        customerSatisfactionPerIntent: {
            ...customerSatisfactionPerIntent,
            data: customerSatisfactionPerIntentPerIntentLevel,
        },
        aiAgentKnowledgeResourcePerIntent: {
            ...aiAgentKnowledgeResourcePerIntent,
            data: aiAgentKnowledgeResourcePerIntentPerIntentLevel,
        },
    }
}

export const convertResultToTableArrayFormat = (
    results: Record<string, IntentMetrics>
) => {
    const convertedArray = Object.entries(results).map(
        ([key, value]: [string, IntentMetrics]) => ({
            ...value,
            name: transformIntentName(key),
            id: key,
        })
    )
    return convertedArray
}

export const useAIAgentInsightsDataset = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
) => {
    const {
        automationOpportunityPerIntent,
        ticketsPerIntent,
        successRatePerIntent,
        customerSatisfactionPerIntent,
        aiAgentKnowledgeResourcePerIntent,
    } = useFetchAllIntentsMetrics(filters, timezone, sorting)
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
        },
    ]

    metrics.forEach(({data, metricKey, resultKey}) =>
        addMetricDataToResults(results, data, metricKey, resultKey)
    )

    // Convert object to array of objects
    const convertedArray = convertResultToTableArrayFormat(results)

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
