import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import { gmvInfluencedQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AISalesAgentGMVInfluencedQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatGmvInfluencedData } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGmvInfluencedCtaButton } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluencedCtaButton'
import type { AiAgentType } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import type { KpiMetric } from 'pages/aiAgent/Overview/types'

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
    const hasAnalytics = useFlag(FeatureFlagKey.AiShoppingAssistantEnabled)
    const { currency } = useCurrency()

    const currentPeriodQuery = gmvInfluencedQueryFactory(
        filters,
        timezone,
        integrationIds?.map((id) => id.toString()),
    )
    const previousPeriodQuery = gmvInfluencedQueryFactory(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
        integrationIds?.map((id) => id.toString()),
    )

    const { data: currentPeriodData, isFetching: isCurrentPeriodFetching } =
        useMetricPerDimensionV2(
            currentPeriodQuery,
            AISalesAgentGMVInfluencedQueryFactoryV2({
                filters: {
                    ...filters,
                    storeIntegrations: integrationIds
                        ? withLogicalOperator(integrationIds)
                        : undefined,
                },
                timezone,
            }),
        )

    const { data: previousPeriodData, isFetching: isPreviousPeriodFetching } =
        useMetricPerDimensionV2(
            previousPeriodQuery,
            AISalesAgentGMVInfluencedQueryFactoryV2({
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                    storeIntegrations: integrationIds
                        ? withLogicalOperator(integrationIds)
                        : undefined,
                },
                timezone,
            }),
        )

    const formattedData = useMemo(
        () => formatGmvInfluencedData(currentPeriodData, previousPeriodData),
        [currentPeriodData, previousPeriodData],
    )

    const isFetching = isCurrentPeriodFetching || isPreviousPeriodFetching

    const action = useGmvInfluencedCtaButton({
        gmvInfluenced: formattedData?.value,
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
        'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
        value: formattedData?.value,
        prevValue: formattedData?.prevValue,
        currency: formattedData?.currency ?? currency,
        hideTrend: !!action,
        action,
    }
}
