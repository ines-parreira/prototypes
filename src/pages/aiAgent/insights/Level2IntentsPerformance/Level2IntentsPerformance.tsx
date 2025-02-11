import React from 'react'

import {useParams} from 'react-router-dom'

import {useInsightPerformanceMetrics} from 'hooks/reporting/automate/useAIAgentInsightsL2Dataset'
import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import {transformIntentName} from 'hooks/reporting/automate/utils'
import {useGetCustomTicketsFieldsDefinitionData} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import {IntentsPerformance} from 'pages/aiAgent/insights/widgets/IntentsPerformance/IntentsPerformance'

import {AIInsightsMetric} from 'state/ui/stats/types'

export const Level2IntentsPerformance = () => {
    const {intentId} = useParams<{
        shopName: string
        intentId: string
    }>()

    const {userTimezone, statsFilters} = useNewAutomateFilters()
    const aiAgentMetrics = useInsightPerformanceMetrics({
        filters: statsFilters,
        timezone: userTimezone,
        intent: intentId,
    })

    const {intentCustomFieldId} = useGetCustomTicketsFieldsDefinitionData()

    return (
        <IntentsPerformance
            sectionTitle="Intent performance:"
            sectionSubtitle={transformIntentName(intentId)}
            shouldDisplayTipsCTA={false}
            period={statsFilters.period}
            metrics={[
                {
                    title: 'Automation opportunity',
                    hint: {
                        title: 'Estimated potential to improve your automation rate, based on the potential uplift between your current automation rate and the ticket volume of the intent.',
                    },
                    trend: aiAgentMetrics.automationOpportunityPerIntent,
                    interpretAs: 'more-is-better',
                    metricFormat: 'decimal-to-percent',
                },
                {
                    title: 'Tickets',
                    trend: aiAgentMetrics.ticketsPerIntent,
                    interpretAs: 'more-is-better',
                    drillDownMetric:
                        AIInsightsMetric.TicketCustomFieldsTicketCount,
                    drillDownMetricAdditionalData: {
                        customFieldValue: [intentId],
                        customFieldId: intentCustomFieldId ?? null,
                    },
                },
                {
                    title: 'Automation rate',
                    trend: aiAgentMetrics.successRatePerIntent,
                    interpretAs: 'more-is-better',
                    metricFormat: 'decimal-to-percent',
                },
                {
                    title: 'Customer satisfaction',
                    trend: aiAgentMetrics.customerSatisfactionPerIntent,
                    interpretAs: 'more-is-better',
                    metricFormat: 'decimal',
                },
            ]}
        />
    )
}
