import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import {
    useAIAgentTicketsPerIntent,
    useCustomerSatisfactionPerIntent,
    useSuccessRatePerIntent,
    useSuccessRateUpliftOpportunityPerIntent,
} from 'hooks/reporting/automate/useAIAgentInsightsDataset'
import { filterMetricDataByIntentLevel } from 'hooks/reporting/automate/utils'
import { OrderDirection } from 'models/api/types'
import { StatsFilters } from 'models/stat/types'
import { IntentTableColumn } from 'pages/aiAgent/insights/IntentTableWidget/types'
import { getPreviousPeriod } from 'utils/reporting'

export const getIntentMetric = (
    metricKey: string,
    metricData: Record<string, string | number | null>[],
) => {
    const value =
        metricData && metricData.length > 0 && metricData[0]?.[metricKey]

    return value ? Number(value) : null
}

export const useAutomatedOpportunityForIntentTrendMetric = ({
    filters,
    timezone,
    sorting,
    intentId,
    intentLevel,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intentId: string
    intentLevel: number
    integrationIds?: string[]
}) => {
    const successRateUpliftOpportunityPerIntent =
        useSuccessRateUpliftOpportunityPerIntent({
            filters,
            timezone,
            sorting,
            intentId,
            integrationIds,
        })
    const successRateUpliftOpportunityPerIntentLevelData =
        filterMetricDataByIntentLevel({
            metricData: successRateUpliftOpportunityPerIntent.data,
            level: intentLevel,
            intentKey: 'TicketCustomFieldsEnriched.valueString',
            valueKey: 'TicketCustomFieldsEnriched.ticketCount',
            totalKey: 'TicketEnriched.ticketCount',
            resultKey: 'successRateUpliftOpportunity',
            metricFor: IntentTableColumn.SuccessRateUpliftOpportunity,
        })

    const prevSuccessRateUpliftOpportunityPerIntent =
        useSuccessRateUpliftOpportunityPerIntent({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
            sorting,
            intentId,
            integrationIds,
        })
    const prevSuccessRateUpliftOpportunityPerIntentLevelData =
        filterMetricDataByIntentLevel({
            metricData: successRateUpliftOpportunityPerIntent.data || [],
            level: intentLevel,
            intentKey: 'TicketCustomFieldsEnriched.valueString',
            valueKey: 'TicketCustomFieldsEnriched.ticketCount',
            totalKey: 'TicketEnriched.ticketCount',
            resultKey: 'successRateUpliftOpportunity',
            metricFor: IntentTableColumn.SuccessRateUpliftOpportunity,
        })

    return {
        data: {
            value: getIntentMetric(
                'successRateUpliftOpportunity',
                successRateUpliftOpportunityPerIntentLevelData,
            ),

            prevValue: getIntentMetric(
                'successRateUpliftOpportunity',
                prevSuccessRateUpliftOpportunityPerIntentLevelData,
            ),
        },
        isFetching:
            successRateUpliftOpportunityPerIntent.isFetching ||
            prevSuccessRateUpliftOpportunityPerIntent.isFetching,
        isError:
            successRateUpliftOpportunityPerIntent.isError ||
            prevSuccessRateUpliftOpportunityPerIntent.isError,
    }
}

export const useAIAgentTicketsForIntentTrendMetric = ({
    filters,
    timezone,
    sorting,
    intentId,
    intentLevel,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intentId?: string
    intentLevel: number
    integrationIds?: string[]
}) => {
    const ticketsPerIntent = useAIAgentTicketsPerIntent(
        filters,
        timezone,
        sorting,
        intentId,
        integrationIds,
    )
    const ticketsByLevelData = filterMetricDataByIntentLevel({
        metricData: ticketsPerIntent.data?.allData || [],
        level: intentLevel,
        intentKey: 'TicketCustomFieldsEnriched.valueString',
        valueKey: 'TicketCustomFieldsEnriched.ticketCount',
        resultKey: 'tickets',
        metricFor: IntentTableColumn.Tickets,
    })

    const prevTicketsPerIntent = useAIAgentTicketsPerIntent(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
        sorting,
        intentId,
        integrationIds,
    )

    const prevTicketsByLevelData = filterMetricDataByIntentLevel({
        metricData: prevTicketsPerIntent.data?.allData?.filter(Boolean) || [],
        level: intentLevel,
        intentKey: 'TicketCustomFieldsEnriched.valueString',
        valueKey: 'TicketCustomFieldsEnriched.ticketCount',
        resultKey: 'tickets',
        metricFor: IntentTableColumn.Tickets,
    })

    return {
        data: {
            value: getIntentMetric('tickets', ticketsByLevelData || []),
            prevValue: getIntentMetric('tickets', prevTicketsByLevelData || []),
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
    intentId,
    intentLevel,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intentId: string
    intentLevel: number
    integrationIds?: string[]
}) => {
    const successRatePerIntent = useSuccessRatePerIntent(
        filters,
        timezone,
        sorting,
        intentId,
        integrationIds,
    )
    const successRatePerIntentPerIntentLevelData =
        filterMetricDataByIntentLevel({
            metricData: successRatePerIntent.data?.filter(Boolean) || [],
            level: intentLevel,
            intentKey: 'TicketCustomFieldsEnriched.valueString',
            valueKey: 'TicketCustomFieldsEnriched.ticketCount',
            totalKey: 'TicketEnriched.ticketCount',
            resultKey: 'successRate',
            metricFor: IntentTableColumn.SuccessRate,
        })

    const prevSuccessRatePerIntent = useSuccessRatePerIntent(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
        sorting,
        intentId,
        integrationIds,
    )
    const prevSuccessRatePerIntentPerIntentLevelData =
        filterMetricDataByIntentLevel({
            metricData: prevSuccessRatePerIntent.data?.filter(Boolean) || [],
            level: intentLevel,
            intentKey: 'TicketCustomFieldsEnriched.valueString',
            valueKey: 'TicketCustomFieldsEnriched.ticketCount',
            totalKey: 'TicketEnriched.ticketCount',
            resultKey: 'successRate',
            metricFor: IntentTableColumn.SuccessRate,
        })

    return {
        data: {
            value: getIntentMetric(
                'successRate',
                successRatePerIntentPerIntentLevelData,
            ),
            prevValue: getIntentMetric(
                'successRate',
                prevSuccessRatePerIntentPerIntentLevelData,
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
    intentId,
    intentLevel,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intentId: string
    intentLevel: number
    integrationIds?: string[]
}) => {
    const customerSatisfactionPerIntent = useCustomerSatisfactionPerIntent(
        filters,
        timezone,
        sorting,
        intentId,
        integrationIds,
    )
    let customerSatisfactionPerIntentPerIntentLevel
    if (customerSatisfactionPerIntent.data) {
        customerSatisfactionPerIntentPerIntentLevel =
            filterMetricDataByIntentLevel({
                metricData:
                    customerSatisfactionPerIntent.data?.filter(Boolean) || [],
                level: intentLevel,
                intentKey: 'TicketCustomFieldsEnriched.valueString',
                valueKey: 'TicketSatisfactionSurveyEnriched.surveyScore',
                totalKey: 'TicketSatisfactionSurveyEnriched.scoredSurveysCount',
                resultKey: 'avgCustomerSatisfaction',
                metricFor: IntentTableColumn.AvgCustomerSatisfaction,
            })
    }

    const prevCustomerSatisfactionPerIntent = useCustomerSatisfactionPerIntent(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
        sorting,
        intentId,
        integrationIds,
    )
    let prevCustomerSatisfactionPerIntentPerIntentLevel
    if (prevCustomerSatisfactionPerIntent.data) {
        prevCustomerSatisfactionPerIntentPerIntentLevel =
            filterMetricDataByIntentLevel({
                metricData:
                    prevCustomerSatisfactionPerIntent.data?.filter(Boolean) ||
                    [],
                level: intentLevel,
                intentKey: 'TicketCustomFieldsEnriched.valueString',
                valueKey: 'TicketSatisfactionSurveyEnriched.surveyScore',
                totalKey: 'TicketSatisfactionSurveyEnriched.scoredSurveysCount',
                resultKey: 'avgCustomerSatisfaction',
                metricFor: IntentTableColumn.AvgCustomerSatisfaction,
            })
    }

    return {
        data: {
            value: getIntentMetric(
                'avgCustomerSatisfaction',
                customerSatisfactionPerIntentPerIntentLevel || [],
            ),
            prevValue: getIntentMetric(
                'avgCustomerSatisfaction',
                prevCustomerSatisfactionPerIntentPerIntentLevel || [],
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
    intentId,
    intentLevel,
    shopName,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intentId: string
    intentLevel: number
    shopName: string
}) => {
    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)

    // success rate uplift opportunity
    const successRateUpliftOpportunityPerIntent =
        useAutomatedOpportunityForIntentTrendMetric({
            filters,
            timezone,
            sorting,
            intentId,
            intentLevel,
            integrationIds,
        })

    // Tickets
    const ticketsForIntent = useAIAgentTicketsForIntentTrendMetric({
        filters,
        timezone,
        sorting,
        intentId,
        intentLevel,
        integrationIds,
    })

    // Success Rate
    const successRateForIntent = useSuccessRateForIntentTrendMetric({
        filters,
        timezone,
        sorting,
        intentId,
        intentLevel,
        integrationIds,
    })

    // Customer Satisfaction
    const customerSatisfactionForIntent =
        useCustomerSatisfactionForIntentTrendMetric({
            filters,
            timezone,
            sorting,
            intentId,
            intentLevel,
            integrationIds,
        })

    return {
        successRateUpliftOpportunityPerIntent,
        ticketsPerIntent: ticketsForIntent,
        successRatePerIntent: successRateForIntent,
        customerSatisfactionPerIntent: customerSatisfactionForIntent,
    }
}
