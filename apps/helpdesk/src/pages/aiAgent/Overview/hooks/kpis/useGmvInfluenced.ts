import { useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import { useStatsMetricTrend } from 'domains/reporting/hooks/useStatsMetricTrend'
import { gmvInfluencedQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AISalesAgentGMVInfluencedQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import { totalSalesAmountUsdQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
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
    const { value: isNewScreens, isLoading: isFlagLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens)
    const useV2 = !isFlagLoading && !!isNewScreens
    const useV1 = !isFlagLoading && !isNewScreens

    const { currency } = useCurrency()

    // V1 path
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
            undefined,
            useV1,
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
            undefined,
            useV1,
        )

    const formattedData = useMemo(
        () => formatGmvInfluencedData(currentPeriodData, previousPeriodData),
        [currentPeriodData, previousPeriodData],
    )

    const isV1Fetching = isCurrentPeriodFetching || isPreviousPeriodFetching

    // V2 path
    const storeFilter = integrationIds?.length
        ? { storeIntegrations: withLogicalOperator(integrationIds) }
        : {}
    const v2Filters = { ...filters, ...storeFilter }

    const v2 = useStatsMetricTrend(
        totalSalesAmountUsdQueryV2Factory({ filters: v2Filters, timezone }),
        totalSalesAmountUsdQueryV2Factory({
            filters: {
                ...v2Filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
        useV2,
    )

    const isFetching = isFlagLoading || (useV2 ? v2.isFetching : isV1Fetching)
    const gmvValue = useV2 ? v2.data?.value : formattedData?.value
    const gmvPrevValue = useV2 ? v2.data?.prevValue : formattedData?.prevValue

    const action = useGmvInfluencedCtaButton({
        gmvInfluenced: gmvValue,
        gmvInfluencedLoading: isFetching,
        isOnNewPlan,
        showEarlyAccessModal,
        showActivationModal,
        aiAgentType,
    })

    return {
        hidden: false,
        title: 'Revenue influenced',
        hint: {
            title: 'Total revenue from orders placed within 3 days of a Shopping Assistant interaction.',
        },
        metricFormat: 'currency-precision-1',
        isLoading: isFetching,
        'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
        value: gmvValue,
        prevValue: gmvPrevValue,
        currency: useV2 ? undefined : (formattedData?.currency ?? currency),
        hideTrend: !!action,
        action,
    }
}
