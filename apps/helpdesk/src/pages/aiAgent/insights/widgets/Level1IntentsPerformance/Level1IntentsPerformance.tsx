import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import { useAIAgentMetrics } from 'domains/reporting/hooks/automate/useAIAgentInsightsDataset'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { MISSING_AI_AGENT_USER_ID } from 'domains/reporting/hooks/automate/utils'
import { getPageStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { AIInsightsMetric } from 'domains/reporting/state/ui/stats/types'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { IntentsPerformance } from 'pages/aiAgent/insights/widgets/IntentsPerformance/IntentsPerformance'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'

export const Level1IntentsPerformance = () => {
    const pageStatsFilters = useAppSelector(
        getPageStatsFiltersWithLogicalOperators,
    )

    const { shopName } = useParams<{
        shopName: string
    }>()

    const aiAgentUserId = useAIAgentUserId()
    const { userTimezone } = useAutomateFilters()
    const aiAgentMetrics = useAIAgentMetrics(
        pageStatsFilters,
        userTimezone,
        shopName,
        aiAgentUserId ?? MISSING_AI_AGENT_USER_ID,
    )

    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)

    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const hasAiAgentTicket =
        aiAgentMetrics.coverageTrend.isFetching ||
        (aiAgentMetrics.coverageTrend?.data?.value &&
            aiAgentMetrics.coverageTrend.data.value > 0)

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentOptimizePageViewed, {
            type: 'Level 1 intents performance',
        })
    })

    return (
        <>
            {!hasAiAgentTicket && (
                <AIBanner>
                    There are no AI Agent interactions for the selected date
                    range.
                </AIBanner>
            )}
            <IntentsPerformance
                sectionTitle="AI Agent performance"
                period={pageStatsFilters.period}
                metrics={[
                    {
                        title: 'Coverage rate',
                        hint: {
                            title: 'Percentage of tickets that AI Agent attempted to respond to.',
                        },
                        trend: aiAgentMetrics.coverageTrend,
                        interpretAs: 'more-is-better',
                        metricFormat: 'decimal-to-percent-precision-1',
                        metricData: {
                            metricName:
                                AIInsightsMetric.TicketDrillDownPerCoverageRate,
                            intentFieldId: intentCustomFieldId,
                            outcomeFieldId: outcomeCustomFieldId,
                            integrationIds: integrationIds,
                        },
                    },
                    {
                        title: 'Automated interactions',
                        hint: {
                            title: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
                            // link: 'https://docs.gorgias.com/en-US/1024587-4ee311de71bc4401985c37a2907b7911', TODO uncomment link when page is ready
                        },
                        trend: aiAgentMetrics.aiAgentAutomatedInteractionTrend,
                        interpretAs: 'more-is-better',
                    },
                    {
                        title: 'Success rate',
                        hint: {
                            title: 'Automated interactions by AI Agent as a percent of all AI Agent interactions.',
                            // link: 'https://docs.gorgias.com/en-US/1024587-4ee311de71bc4401985c37a2907b7911', TODO uncomment link when page is ready
                        },
                        trend: aiAgentMetrics.aiAgentSuccessRate,
                        interpretAs: 'more-is-better',
                        metricFormat: 'decimal-to-percent-precision-1',
                    },
                    {
                        title: 'Customer satisfaction',
                        hint: {
                            title: 'AI Agent’s average CSAT score for tickets for which a survey was sent within the timeframe; surveys are sent following ticket resolution.',
                            // link: 'https://www.gorgias.com', TODO uncomment link when page is ready
                        },
                        trend: aiAgentMetrics.aiAgentCSAT,
                        interpretAs: 'more-is-better',
                        metricFormat: 'decimal-precision-1',
                        metricData: aiAgentUserId
                            ? {
                                  title: 'Customer satisfaction',
                                  metricName:
                                      AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                                  perAgentId: aiAgentUserId,
                                  intentFieldId: intentCustomFieldId,
                                  outcomeFieldId: outcomeCustomFieldId,
                                  integrationIds: integrationIds,
                              }
                            : undefined,
                    },
                ]}
            />
        </>
    )
}
