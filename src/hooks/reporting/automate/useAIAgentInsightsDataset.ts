import {useMemo} from 'react'

import {AI_MANAGED_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {AutomationDatasetMeasure} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetMeasure} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    automationDatasetQueryFactory,
    billableTicketDatasetExcludingAIAgentQueryFactory,
} from 'models/reporting/queryFactories/automate_v2/metrics'
import {customerSatisfactionMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {customFieldsTicketTotalCountQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {FilterKey, StatsFilters} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {activeParams} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {getPreviousPeriod} from 'utils/reporting'

import {
    getAiAgentSuccessRate,
    getCoverageRateUnfilteredDenominatorTrend,
} from './automateStatsCalculatedTrends'
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
