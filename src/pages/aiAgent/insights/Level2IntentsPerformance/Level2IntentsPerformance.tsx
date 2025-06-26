import { useParams } from 'react-router-dom'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { useInsightPerformanceMetrics } from 'hooks/reporting/automate/useAIAgentInsightsL2Dataset'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import { transformIntentName } from 'hooks/reporting/automate/utils'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
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

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentOptimizePageViewed, {
            type: 'Level 2 intents performance',
        })
    })

    return (
        <IntentsPerformance
            sectionTitle="Intent performance:"
            sectionSubtitle={
                intentId ? transformIntentName(intentId) : undefined
            }
            period={pageStatsFilters.period}
            metrics={[
                {
                    title: 'Improvement potential',
                    hint: {
                        title: "The percentage of AI Agent tickets for this intent that didn't result in a successful automation. Higher values suggest a greater opportunity to improve knowledge or coverage. This is calculated as tickets that didn't result in a successful automation for this intent divided by total AI Agent tickets.",
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
