import { useParams } from 'react-router-dom'

import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { useInsightPerformanceMetrics } from 'hooks/reporting/automate/useAIAgentInsightsL2Dataset'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import { transformIntentName } from 'hooks/reporting/automate/utils'
import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { IntentsPerformance } from 'pages/aiAgent/insights/widgets/IntentsPerformance/IntentsPerformance'
import { getPageStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { AIInsightsMetric } from 'state/ui/stats/types'

const INTENT_LEVEL = 2

export const Level2IntentsPerformance = () => {
    const pageStatsFilters = useAppSelector(
        getPageStatsFiltersWithLogicalOperators,
    )

    const { intentId, shopName } = useParams<{
        shopName: string
        intentId: string
    }>()

    const { userTimezone } = useAutomateFilters()
    const aiAgentMetrics = useInsightPerformanceMetrics({
        filters: pageStatsFilters,
        timezone: userTimezone,
        intentId: intentId,
        intentLevel: INTENT_LEVEL,
        shopName,
    })

    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)

    const aiAgentUserId = useAIAgentUserId()
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    return (
        <IntentsPerformance
            sectionTitle="Intent performance:"
            sectionSubtitle={
                intentId ? transformIntentName(intentId) : undefined
            }
            shouldDisplayTipsCTA={false}
            period={pageStatsFilters.period}
            metrics={[
                {
                    title: 'Success rate uplift opportunity',
                    hint: {
                        title: `Estimated potential to improve your success rate, based on the number of tickets that haven't been automated. \nExample: If there are 100 total AI agent tickets and a given intent / topic has 15 tickets that have not been automated, the uplift opportunity is 15%.`,
                    },
                    trend: aiAgentMetrics.successRateUpliftOpportunityPerIntent,
                    interpretAs: 'more-is-better',
                    metricFormat: 'decimal-to-percent-precision-1',
                },
                {
                    title: 'Tickets',
                    trend: aiAgentMetrics.ticketsPerIntent,
                    interpretAs: 'more-is-better',
                    drillDownMetric:
                        AIInsightsMetric.TicketCustomFieldsTicketCount,
                    drillDownMetricAdditionalData: {
                        intentFieldValues: [intentId],
                        intentFieldId: intentCustomFieldId,
                        outcomeFieldId: outcomeCustomFieldId,
                        integrationIds: integrationIds,
                    },
                },
                {
                    title: 'Success rate',
                    trend: aiAgentMetrics.successRatePerIntent,
                    interpretAs: 'more-is-better',
                    metricFormat: 'decimal-to-percent-precision-1',
                },
                {
                    title: 'Customer satisfaction',
                    trend: aiAgentMetrics.customerSatisfactionPerIntent,
                    interpretAs: 'more-is-better',
                    metricFormat: 'decimal-precision-1',
                    drillDownMetric:
                        AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                    drillDownMetricAdditionalData: {
                        perAgentId: aiAgentUserId,
                        intentFieldId: intentCustomFieldId,
                        outcomeFieldId: outcomeCustomFieldId,
                        intentFieldValues: [intentId],
                        integrationIds: integrationIds,
                    },
                },
            ]}
        />
    )
}
