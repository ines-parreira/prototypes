import React from 'react'

import {useParams} from 'react-router-dom'

import {useAIAgentMetrics} from 'hooks/reporting/automate/useAIAgentInsightsDataset'
import {useAIAgentUserId} from 'hooks/reporting/automate/useAIAgentUserId'
import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import useAppSelector from 'hooks/useAppSelector'
import {useGetCustomTicketsFieldsDefinitionData} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import {AUTOMATION_RATE_FIXED_STATS} from 'pages/automate/automate-metrics/constants'
import {toPercentage} from 'pages/automate/automate-metrics/utils'
import PerformanceTip from 'pages/stats/PerformanceTip'
import {getPageStatsFilters} from 'state/stats/selectors'

import {AIInsightsMetric} from 'state/ui/stats/types'

import {IntentsPerformance} from '../IntentsPerformance/IntentsPerformance'

const getPerformanceTipType = (
    top10P: number,
    avg: number,
    value?: number | null
) => {
    if (value === null || value === undefined) return 'neutral'
    if (value > top10P) return 'success'
    if (value > avg) return 'light-success'
    if (value > 0) return 'light-error'
    return 'neutral'
}

const AUTOMATED_OUTCOMS = ['Close::With message', 'Close::Without message']

export const Level1IntentsPerformance = () => {
    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const {shopName} = useParams<{
        shopName: string
    }>()

    const {userTimezone} = useNewAutomateFilters()
    const aiAgentMetrics = useAIAgentMetrics(pageStatsFilters, userTimezone)

    const aiAgentUserId = useAIAgentUserId()
    const {intentCustomFieldId, outcomeCustomFieldId} =
        useGetCustomTicketsFieldsDefinitionData()

    return (
        <IntentsPerformance
            sectionTitle="Optimize AI Agent performance"
            shouldDisplayTipsCTA={true}
            period={pageStatsFilters.period}
            metrics={[
                {
                    title: 'Coverage rate',
                    hint: {
                        title: 'Percentage of email tickets that AI Agent attempted to respond to.',
                    },
                    trend: aiAgentMetrics.coverageTrend,
                    interpretAs: 'more-is-better',
                    metricFormat: 'decimal-to-percent',
                    tip: (
                        <PerformanceTip showBenchmark={false}>
                            Set up all{' '}
                            <a
                                target="blank"
                                href={`/app/automation/shopify/${shopName}/ai-agent/settings`}
                            >
                                channels & email addresses
                            </a>{' '}
                            to improve your ticket coverage rate of AI Agent
                        </PerformanceTip>
                    ),
                    drillDownMetric:
                        AIInsightsMetric.TicketDrillDownPerCoverageRate,
                    drillDownMetricAdditionalData: {
                        customFieldId: intentCustomFieldId,
                    },
                },
                {
                    title: 'Automated interactions',
                    hint: {
                        title: 'Total of fully automated AI Agent interactions solved without any agent intervention?',
                        link: 'https://docs.gorgias.com/en-US/1024587-4ee311de71bc4401985c37a2907b7911',
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
                            for tactical tips on how to use Automate to its full
                            potential. Visit
                            <a target="blank" href="/app/settings/billing">
                                {' '}
                                billing
                            </a>{' '}
                            to make sure your Automate plan is the right size
                            for you.
                        </PerformanceTip>
                    ),
                    drillDownMetric:
                        AIInsightsMetric.TicketDrillDownPerAutomatedInteractions,
                    drillDownMetricAdditionalData: {
                        customFieldId: outcomeCustomFieldId,
                        customFieldValue: AUTOMATED_OUTCOMS,
                    },
                },
                {
                    title: 'Success rate',
                    hint: {
                        title: 'Automated interactions by AI Agent as a percent of all AI Agent interactions.',
                        link: 'https://docs.gorgias.com/en-US/1024587-4ee311de71bc4401985c37a2907b7911',
                    },
                    trend: aiAgentMetrics.aiAgentSuccessRate,
                    interpretAs: 'more-is-better',
                    metricFormat: 'decimal-to-percent',
                    tip: (
                        <PerformanceTip
                            topTen={toPercentage(
                                AUTOMATION_RATE_FIXED_STATS.top10P
                            )}
                            avgMerchant={toPercentage(
                                AUTOMATION_RATE_FIXED_STATS.avg
                            )}
                            type={getPerformanceTipType(
                                AUTOMATION_RATE_FIXED_STATS.top10P,
                                AUTOMATION_RATE_FIXED_STATS.avg,
                                aiAgentMetrics.aiAgentSuccessRate.data?.value
                            )}
                        >
                            Set up all{' '}
                            <a
                                target="blank"
                                href="https://link.gorgias.com/aut"
                            >
                                Automate features
                            </a>{' '}
                            to improve your automation rate across all of your
                            channels.
                        </PerformanceTip>
                    ),
                    drillDownMetric:
                        AIInsightsMetric.TicketDrillDownPerAutomatedInteractions,
                    drillDownMetricAdditionalData: {
                        customFieldId: outcomeCustomFieldId,
                        customFieldValue: AUTOMATED_OUTCOMS,
                    },
                },
                {
                    title: 'Customer satisfaction',
                    hint: {
                        title: 'AI Agent’s average CSAT score for tickets for which a survey was sent within the timeframe; surveys are sent following ticket resolution.',
                        link: 'https://www.gorgias.com',
                    },
                    trend: aiAgentMetrics.aiAgentCSAT,
                    interpretAs: 'more-is-better',
                    metricFormat: 'decimal',
                    tip: (
                        <PerformanceTip
                            topTen="4.7"
                            avgMerchant="4.2"
                            type={getPerformanceTipType(
                                4.7,
                                4.2,
                                aiAgentMetrics.aiAgentCSAT.data?.value
                            )}
                        >
                            Take advantage of satisfied customers to ask nicely
                            for a review.
                        </PerformanceTip>
                    ),
                    drillDownMetric:
                        AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                    drillDownMetricAdditionalData: {
                        perAgentId: aiAgentUserId,
                        customFieldId: outcomeCustomFieldId,
                    },
                },
            ]}
        />
    )
}
