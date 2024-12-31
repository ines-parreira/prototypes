import {useMemo} from 'react'

import {AI_MANAGED_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    transformIntentName,
    enrichWithAutomationOpportunity,
    enrichWithSuccessRate,
} from 'hooks/reporting/automate/utils'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {OrderDirection} from 'models/api/types'
import {AutomationDatasetMeasure} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetMeasure} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    automationDatasetQueryFactory,
    billableTicketDatasetExcludingAIAgentQueryFactory,
} from 'models/reporting/queryFactories/automate_v2/metrics'
import {customerSatisfactionMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {customFieldsTicketTotalCountQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {FilterKey, StatsFilters} from 'models/stat/types'
import {IntentMetrics} from 'pages/aiAgent/insights/IntentTableWidget/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {activeParams} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {getPreviousPeriod} from 'utils/reporting'

import {
    useTotalAiAgentTicketsByCustomField,
    useAiAgenTickets,
    useAiAgentTicketCountPerIntent,
    useCustomerSatisfactionMetricPerIntent,
} from './aiAgentMetrics'
import {
    getAiAgentSuccessRate,
    getCoverageRateUnfilteredDenominatorTrend,
} from './automateStatsCalculatedTrends'
import {
    CUSTOM_FIELD_AI_AGENT_CLOSE,
    CUSTOM_FIELD_AI_AGENT_HANDOVER,
} from './types'
import {useAIAgentUserId} from './useAIAgentUserId'

// COVERAGE_RATE: #AI_AGENT_TICKETS / Billable interactions (same as automation rate denomitor)
// AUTOMATED INTERACTIONS: fully automated interactions by AI Agent
// SUCCESS RATE: #AI_AGENT_AUTOMATED_INTERACTIONS / #AI_AGENT_TICKETS
// CSAT: Customer satisfaction score for AI Agent
export const useAIAgentMetrics = (
    filters: StatsFilters,
    timezone: string
): Record<any, MetricTrend> => {
    const onlyPeriodFilter = useMemo(
        () => ({[FilterKey.Period]: filters.period}),
        [filters.period]
    )

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

    const allAutomatedInteractionsData = useMultipleMetricsTrends(
        automationDatasetQueryFactory(onlyPeriodFilter, timezone),
        automationDatasetQueryFactory(
            {period: getPreviousPeriod(filters.period)},
            timezone
        )
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
            String(customField?.id)
        ),
        customFieldsTicketTotalCountQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            String(customField?.id)
        )
    )

    const ticketDatasetExcludingAIAgent = useMultipleMetricsTrends(
        billableTicketDatasetExcludingAIAgentQueryFactory(
            filters,
            timezone,
            aiAgentUserId
        ),
        billableTicketDatasetExcludingAIAgentQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            aiAgentUserId
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

    const allAutomatedInteractions =
        allAutomatedInteractionsData.data?.[
            AutomationDatasetMeasure.AutomatedInteractions
        ]

    const allAutomatedInteractionsByAutoResponders =
        allAutomatedInteractionsData.data?.[
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders
        ]

    const billableTicketsExcludingAIAgent =
        ticketDatasetExcludingAIAgent.data?.[
            BillableTicketDatasetMeasure.BillableTicketCount
        ]

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

    const isFetching =
        allAutomatedInteractionsData.isFetching ||
        aiAgentAutomatedInteractionsData.isFetching ||
        aiAgentTicketsData.isFetching ||
        ticketDatasetExcludingAIAgent.isFetching ||
        customerSatisfactionAiAgentData.isFetching

    const isError =
        allAutomatedInteractionsData.isError ||
        aiAgentAutomatedInteractionsData.isError ||
        aiAgentTicketsData.isError ||
        ticketDatasetExcludingAIAgent.isError ||
        customerSatisfactionAiAgentData.isError

    return {
        coverageTrend: getCoverageRateUnfilteredDenominatorTrend({
            isFetching,
            isError,
            aiAgentTickets,
            allAutomatedInteractions,
            allAutomatedInteractionsByAutoResponders,
            billableTicketsCount: billableTicketsExcludingAIAgent,
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
    sorting?: OrderDirection
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
        CUSTOM_FIELD_AI_AGENT_HANDOVER
    )

    const ticketIds = aiAgentNotAutomatedTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => id !== null)

    const aiAgentTicketsNotAutomatedGroupedByIntent =
        useAiAgentTicketCountPerIntent(
            filters,
            timezone,
            customFieldAiIntent,
            ticketIds
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
    sorting?: OrderDirection
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
        .filter((id): id is string => id !== null)

    const aiAgentTicketsGroupedByIntent = useAiAgentTicketCountPerIntent(
        filters,
        timezone,
        customFieldAiIntent,
        ticketIds,
        sorting
    )

    return aiAgentTicketsGroupedByIntent
}

// SUCCESS RATE: # of Automated AI Agent tickets per intent / AI Agent Tickets per intent
export const useSuccessRatePerIntent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
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
        CUSTOM_FIELD_AI_AGENT_CLOSE
    )

    const ticketsPerIntent = useAIAgentTicketsPerIntent(filters, timezone)

    const automatedTicketIds = aiAgentAutomatedTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => id !== null)

    const aiAgentAutomatedTicketsGroupedByIntent =
        useAiAgentTicketCountPerIntent(
            filters,
            timezone,
            customFieldAiIntent,
            automatedTicketIds
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

export const useCustomerSatisfactionPerIntent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
) => {
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const customFieldAiIntent = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_INTENT
    )

    const csatPerIntent = useCustomerSatisfactionMetricPerIntent(
        filters,
        timezone,
        customFieldAiIntent,
        sorting
    )

    return csatPerIntent
}

export const addMetricDataToResults = (
    results: Record<string, IntentMetrics>,
    metricData: Record<string, string | number | null>[],
    metricKey: string,
    resultKey?: string
) => {
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

const useFetchAllIntentsMetrics = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
) => {
    // Fetch all metrics for all intents
    const automationOpportunityPerIntent = useAutomationOpportunityPerIntent(
        filters,
        timezone,
        sorting
    )

    const ticketsPerIntent = useAIAgentTicketsPerIntent(
        filters,
        timezone,
        sorting
    )

    const successRatePerIntent = useSuccessRatePerIntent(
        filters,
        timezone,
        sorting
    )

    const customerSatisfactionPerIntent = useCustomerSatisfactionPerIntent(
        filters,
        timezone,
        sorting
    )

    return {
        automationOpportunityPerIntent,
        ticketsPerIntent,
        successRatePerIntent,
        customerSatisfactionPerIntent,
    }
}

export const convertResultToTableArrayFormat = (
    results: Record<string, IntentMetrics>
) => {
    const convertedArray = Object.entries(results).map(
        ([key, value]: [string, IntentMetrics]) => ({
            ...value,
            name: transformIntentName(key),
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
    } = useFetchAllIntentsMetrics(filters, timezone, sorting)

    const results: Record<string, IntentMetrics> = {}
    const metrics = [
        {
            data: automationOpportunityPerIntent.data,
            metricKey: 'automationOpportunity',
        },
        {
            data: ticketsPerIntent.data?.allData || [],
            metricKey: 'TicketCustomFieldsEnriched.ticketCount',
            resultKey: 'tickets',
        },
        {
            data: successRatePerIntent.data,
            metricKey: 'successRate',
            resultKey: 'automationRate',
        },
        {
            data: customerSatisfactionPerIntent.data?.allData || [],
            metricKey: 'customerSatisfaction',
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
        customerSatisfactionPerIntent.isFetching

    return {
        data: convertedArray,
        isFetching: isFetching,
    }
}
