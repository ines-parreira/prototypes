import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import { gmvInfluencedQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { useGmvInfluencedCtaButton } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluencedCtaButton'
import { AiAgentType } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import { KpiMetric } from 'pages/aiAgent/Overview/types'
import { getPreviousPeriod } from 'utils/reporting'

export const useGmvInfluenced = ({
    filters,
    timezone,
    aiAgentType,
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
}: {
    filters: StatsFilters
    timezone: string
    aiAgentType?: AiAgentType
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
}): KpiMetric => {
    const hasAnalytics =
        useFlags()[FeatureFlagKey.StandaloneAiSalesAnalyticsPage]

    const { currency } = useCurrency()

    const { data, isFetching } = useMetricTrend(
        gmvInfluencedQueryFactory(filters, timezone),
        gmvInfluencedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

    const action = useGmvInfluencedCtaButton({
        gmvInfluenced: data?.value,
        gmvInfluencedLoading: isFetching,
        isOnNewPlan,
        showEarlyAccessModal,
        showActivationModal,
        aiAgentType,
    })

    return {
        hidden: !hasAnalytics,
        title: 'GMV Influenced',
        hint: {
            title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
        },
        metricFormat: 'currency',
        isLoading: isFetching,
        currency,
        'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
        ...data,
        hideTrend: !!action,
        action,
    }
}
