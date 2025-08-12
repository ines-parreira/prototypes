import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { gmvInfluencedQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGmvInfluencedCtaButton } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluencedCtaButton'
import { AiAgentType } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import { KpiMetric } from 'pages/aiAgent/Overview/types'

export const useGmvInfluenced = ({
    filters,
    timezone,
    aiAgentType,
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    aiAgentType?: AiAgentType
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
    integrationIds?: number[]
}): KpiMetric => {
    const hasAnalytics = useFlags()[FeatureFlagKey.AiShoppingAssistantEnabled]

    const { currency } = useCurrency(
        integrationIds?.[0] ? integrationIds[0] : undefined,
    )

    const { data, isFetching } = useMetricTrend(
        gmvInfluencedQueryFactory(
            filters,
            timezone,
            integrationIds?.map((id) => id.toString()),
        ),
        gmvInfluencedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
            integrationIds?.map((id) => id.toString()),
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
        metricFormat: 'currency-precision-1',
        isLoading: isFetching,
        currency,
        'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
        ...data,
        hideTrend: !!action,
        action,
    }
}
