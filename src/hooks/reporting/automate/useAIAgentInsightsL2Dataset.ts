import {OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

import {
    useAIAgentTicketsPerIntent,
    useAutomationOpportunityPerIntent,
    useCustomerSatisfactionPerIntent,
    useSuccessRatePerIntent,
} from './useAIAgentInsightsDataset'

export const getIntentMetric = (
    metricKey: string,
    metricData: Record<string, string | number | null>[]
) => {
    const value =
        metricData && metricData.length > 0 && metricData[0]?.[metricKey]

    return value ? Number(value) : null
}

export const useAutomatedOpportunityForIntentTrendMetric = ({
    filters,
    timezone,
    sorting,
    intent,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intent?: string
}) => {
    const automationOpportunityPerIntent = useAutomationOpportunityPerIntent(
        filters,
        timezone,
        sorting,
        intent
    )
    const prevAutomationOpportunityPerIntent =
        useAutomationOpportunityPerIntent(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
            sorting,
            intent
        )

    return {
        data: {
            value: getIntentMetric(
                'automationOpportunity',
                automationOpportunityPerIntent.data
            ),

            prevValue: getIntentMetric(
                'automationOpportunity',
                prevAutomationOpportunityPerIntent.data
            ),
        },
        isFetching:
            automationOpportunityPerIntent.isFetching ||
            prevAutomationOpportunityPerIntent.isFetching,
        isError:
            automationOpportunityPerIntent.isError ||
            prevAutomationOpportunityPerIntent.isError,
    }
}

export const useAIAgentTicketsForIntentTrendMetric = ({
    filters,
    timezone,
    sorting,
    intent,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intent?: string
}) => {
    const ticketsPerIntent = useAIAgentTicketsPerIntent(
        filters,
        timezone,
        sorting,
        intent
    )
    const prevTicketsPerIntent = useAIAgentTicketsPerIntent(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
        sorting,
        intent
    )

    return {
        data: {
            value: getIntentMetric(
                'TicketCustomFieldsEnriched.ticketCount',
                ticketsPerIntent.data?.allData || []
            ),
            prevValue: getIntentMetric(
                'TicketCustomFieldsEnriched.ticketCount',
                prevTicketsPerIntent.data?.allData || []
            ),
        },
        isFetching:
            ticketsPerIntent.isFetching || prevTicketsPerIntent.isFetching,
        isError: ticketsPerIntent.isError || prevTicketsPerIntent.isError,
    }
}

export const useSuccessRateForIntentTrendMetric = ({
    filters,
    timezone,
    sorting,
    intent,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intent?: string
}) => {
    const successRatePerIntent = useSuccessRatePerIntent(
        filters,
        timezone,
        sorting,
        intent
    )
    const prevSuccessRatePerIntent = useSuccessRatePerIntent(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
        sorting,
        intent
    )

    return {
        data: {
            value: getIntentMetric('successRate', successRatePerIntent.data),
            prevValue: getIntentMetric(
                'successRate',
                prevSuccessRatePerIntent.data
            ),
        },
        isFetching:
            successRatePerIntent.isFetching ||
            prevSuccessRatePerIntent.isFetching,
        isError:
            successRatePerIntent.isError || prevSuccessRatePerIntent.isError,
    }
}

export const useCustomerSatisfactionForIntentTrendMetric = ({
    filters,
    timezone,
    sorting,
    intent,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intent?: string
}) => {
    const customerSatisfactionPerIntent = useCustomerSatisfactionPerIntent(
        filters,
        timezone,
        sorting,
        intent
    )
    const prevCustomerSatisfactionPerIntent = useCustomerSatisfactionPerIntent(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
        sorting,
        intent
    )

    return {
        data: {
            value: getIntentMetric(
                'TicketSatisfactionSurveyEnriched.avgSurveyScore',
                customerSatisfactionPerIntent.data?.allData || []
            ),
            prevValue: getIntentMetric(
                'TicketSatisfactionSurveyEnriched.avgSurveyScore',
                prevCustomerSatisfactionPerIntent.data?.allData || []
            ),
        },
        isFetching:
            customerSatisfactionPerIntent.isFetching ||
            prevCustomerSatisfactionPerIntent.isFetching,
        isError:
            customerSatisfactionPerIntent.isError ||
            prevCustomerSatisfactionPerIntent.isError,
    }
}

export const useInsightPerformanceMetrics = ({
    filters,
    timezone,
    sorting,
    intent,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intent?: string
}) => {
    // Automation Opportunity
    const automationOpportunityPerIntent =
        useAutomatedOpportunityForIntentTrendMetric({
            filters,
            timezone,
            sorting,
            intent,
        })

    // Tickets
    const ticketsForIntent = useAIAgentTicketsForIntentTrendMetric({
        filters,
        timezone,
        sorting,
        intent,
    })

    // Success Rate
    const successRateForIntent = useSuccessRateForIntentTrendMetric({
        filters,
        timezone,
        sorting,
        intent,
    })

    // Customer Satisfaction
    const customerSatisfactionForIntent =
        useCustomerSatisfactionForIntentTrendMetric({
            filters,
            timezone,
            sorting,
            intent,
        })

    return {
        automationOpportunityPerIntent,
        ticketsPerIntent: ticketsForIntent,
        successRatePerIntent: successRateForIntent,
        customerSatisfactionPerIntent: customerSatisfactionForIntent,
    }
}
