import { useParams } from 'react-router-dom'

import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { useAIAgentMetrics } from 'hooks/reporting/automate/useAIAgentInsightsDataset'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { IntentsPerformance } from 'pages/aiAgent/insights/widgets/IntentsPerformance/IntentsPerformance'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import PerformanceTip from 'pages/stats/common/components/PerformanceTip'
import { getPageStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { AIInsightsMetric } from 'state/ui/stats/types'

const getPerformanceTipType = (
    top10P: number,
    avg: number,
    value?: number | null,
) => {
    if (value === null || value === undefined) return 'neutral'
    if (value > top10P) return 'success'
    if (value > avg) return 'light-success'
    if (value > 0) return 'light-error'
    return 'neutral'
}

export const Level1IntentsPerformance = () => {
    const pageStatsFilters = useAppSelector(
        getPageStatsFiltersWithLogicalOperators,
    )

    const { shopName } = useParams<{
        shopName: string
    }>()

    const { userTimezone } = useAutomateFilters()
    const aiAgentMetrics = useAIAgentMetrics(
        pageStatsFilters,
        userTimezone,
        shopName,
    )

    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)

    const aiAgentUserId = useAIAgentUserId()
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentNavigation = useAiAgentNavigation({ shopName })

    const hasAiAgentTicket =
        aiAgentMetrics.coverageTrend.isFetching ||
        (aiAgentMetrics.coverageTrend?.data?.value &&
            aiAgentMetrics.coverageTrend.data.value > 0)

    return (
        <>
            {!hasAiAgentTicket && (
                <AIBanner>
                    There are no AI Agent interactions for the selected date
                    range.
                </AIBanner>
            )}
            <IntentsPerformance
                sectionTitle="Optimize AI Agent performance"
                shouldDisplayTipsCTA={true}
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
                        tip: (
                            <PerformanceTip showBenchmark={false}>
                                Set up all{' '}
                                <a
                                    target="blank"
                                    href={aiAgentNavigation.routes.configuration()}
                                >
                                    channels & email addresses
                                </a>{' '}
                                to improve your ticket coverage rate of AI Agent
                            </PerformanceTip>
                        ),
                        drillDownMetric:
                            AIInsightsMetric.TicketDrillDownPerCoverageRate,
                        drillDownMetricAdditionalData: {
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
                        tip: (
                            <PerformanceTip showBenchmark={false}>
                                Check out our{' '}
                                <a
                                    target="blank"
                                    href="https://link.gorgias.com/aut-playbook"
                                >
                                    {' '}
                                    Automation Playbook
                                </a>{' '}
                                for tactical tips on how to use AI Agent to its
                                full potential. Visit
                                <a target="blank" href="/app/settings/billing">
                                    {' '}
                                    billing
                                </a>{' '}
                                to make sure your AI Agent plan is the right
                                size for you.
                            </PerformanceTip>
                        ),
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
                        tip: (
                            <PerformanceTip showBenchmark={false}>
                                Review your existing{' '}
                                <a
                                    target="blank"
                                    href={aiAgentNavigation.routes.guidance}
                                >
                                    knowledge
                                </a>{' '}
                                and add missing one to improve your success rate
                                of AI Agent.
                            </PerformanceTip>
                        ),
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
                        tip: (
                            <PerformanceTip
                                topTen="4.7"
                                avgMerchant="4.2"
                                type={getPerformanceTipType(
                                    4.7,
                                    4.2,
                                    aiAgentMetrics.aiAgentCSAT.data?.value,
                                )}
                            >
                                Take advantage of satisfied customers to ask
                                nicely for a review.
                            </PerformanceTip>
                        ),
                        drillDownMetric:
                            AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                        drillDownMetricAdditionalData: {
                            perAgentId: aiAgentUserId,
                            intentFieldId: intentCustomFieldId,
                            outcomeFieldId: outcomeCustomFieldId,
                            integrationIds: integrationIds,
                            customFieldId: null,
                            customFieldValue: null,
                        },
                    },
                ]}
            />
        </>
    )
}
