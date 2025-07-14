import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import moment from 'moment'
import { shallowEqual } from 'react-redux'

import {
    fetchMetricPerDimension,
    ReportingMetricItem,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { reportingKeys } from 'domains/reporting/models/queries'
import { gmvInfluencedQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { IntegrationType } from 'models/integration/constants'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { formatAmount } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils'
import { getTimezone } from 'state/currentUser/selectors'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

export type TrialMetrics = {
    gmvInfluenced: string
    gmvInfluencedRate: number
    isLoading: boolean
}

export const useTrialMetrics = (): TrialMetrics => {
    const storeIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
        shallowEqual,
    )
    const { storeActivations } = useStoreActivations()

    const storeIds = useMemo(() => {
        if (!storeActivations || !storeIntegrations) {
            return []
        }

        return Object.values(storeActivations)
            .map((storeActivation) => {
                const storeIntegration = storeIntegrations.find(
                    (integration) => integration.name === storeActivation.name,
                )
                return storeIntegration?.id
            })
            .filter((id): id is number => id !== undefined)
    }, [storeActivations, storeIntegrations])

    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const { from, to } = useMemo(() => {
        const now = moment()
        // TODO: ⚠️ The rounded below has been done to mitigate an infinite query to /api/reporting initiated by this hook. This mitigation is not ideal and just temporary.
        // -------
        // Round to the nearest hour to make the query stable for longer periods
        const roundedNow = now.clone().startOf('hour')

        return {
            from: roundedNow.clone().subtract(14, 'd').toISOString(),
            to: roundedNow.toISOString(),
        }
    }, [])

    const filters = useMemo(
        () => ({
            period: {
                end_datetime: to,
                start_datetime: from,
            },
            storeIntegrations:
                storeIds.length > 0
                    ? {
                          operator: LogicalOperatorEnum.ONE_OF,
                          values: storeIds,
                      }
                    : undefined,
        }),
        [to, from, storeIds],
    )

    const hasStores = storeIds.length > 0

    // Create query objects first for stable query keys
    const currentPeriodQuery = useMemo(
        () => gmvInfluencedQueryFactory(filters, timezone),
        [filters, timezone],
    )

    // Use the same query keys that useMetricPerDimension would use
    const gmvInfluencedQueryKey = useMemo(
        () => reportingKeys.post([currentPeriodQuery]),
        [currentPeriodQuery],
    )

    const gmvInfluencedRateQueryKey = useMemo(
        () => [
            'trial-metrics',
            'gmv-influenced-rate',
            from,
            to,
            storeIds,
            timezone,
        ],
        [from, to, storeIds, timezone],
    )

    // GMV Influenced data query - shares cache with useMetricPerDimension
    const { data: gmvInfluencedData, isFetching: isGmvInfluencedFetching } =
        useQuery({
            queryKey: gmvInfluencedQueryKey,
            queryFn: async () => {
                return await fetchMetricPerDimension(currentPeriodQuery)
            },
            enabled: hasStores,
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
        })

    // GMV Influenced Rate query - simplified to return a mock value for now
    const {
        data: gmvInfluencedRateData,
        isFetching: isGmvInfluencedRateFetching,
    } = useQuery({
        queryKey: gmvInfluencedRateQueryKey,
        queryFn: async () => {
            // Return a simple rate value for now
            return { value: 0 }
        },
        enabled: hasStores,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate
    const currency = currentPlan?.currency ?? 'USD'

    const gmvInfluenced = useMemo(() => {
        if (
            !gmvInfluencedData ||
            !gmvInfluencedData.data ||
            !gmvInfluencedData.data.allData ||
            !Array.isArray(gmvInfluencedData.data.allData)
        ) {
            return 0
        }

        return gmvInfluencedData.data.allData.reduce(
            (acc: number, curr: ReportingMetricItem) => {
                const gmvValue = curr[AiSalesAgentOrdersMeasure.Gmv]
                return acc + (gmvValue ? parseFloat(gmvValue) : 0)
            },
            0,
        )
    }, [gmvInfluencedData])

    return {
        gmvInfluenced: formatAmount(currency, gmvInfluenced),
        gmvInfluencedRate: gmvInfluencedRateData?.value || 0,
        isLoading: isGmvInfluencedFetching || isGmvInfluencedRateFetching,
    }
}
