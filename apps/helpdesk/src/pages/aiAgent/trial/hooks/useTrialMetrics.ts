import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { shallowEqual } from 'react-redux'

import {
    fetchMetricPerDimension,
    ReportingMetricItem,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    gmvInfluencedQueryFactory,
    gmvQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { calculateRate } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import { getTimeFilters } from 'pages/aiAgent/trial/utils/getTimeFilters'
import { formatAmount } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils'
import { getTimezone } from 'state/currentUser/selectors'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

export type TrialMetrics = {
    gmvInfluenced: string
    gmvInfluencedRate: number
    isLoading: boolean
}

const REFETCH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

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
    const hasStores = storeIds.length > 0

    const gmvInfluencedQueryKey = useMemo(
        () => ['trial-metrics', 'gmv-influenced', storeIds, timezone],
        [storeIds, timezone],
    )

    const { data: gmvInfluencedData, isFetching: isGmvInfluencedFetching } =
        useQuery({
            queryKey: gmvInfluencedQueryKey,
            queryFn: async () => {
                const { filters } = getTimeFilters(storeIds)

                const currentPeriodQuery = gmvInfluencedQueryFactory(
                    filters,
                    timezone,
                )
                return await fetchMetricPerDimension(currentPeriodQuery)
            },
            enabled: hasStores,
            refetchInterval: REFETCH_INTERVAL_MS,
            staleTime: REFETCH_INTERVAL_MS,
            cacheTime: REFETCH_INTERVAL_MS,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
        })

    const gmvQueryKey = useMemo(
        () => ['trial-metrics', 'gmv', storeIds, timezone],
        [storeIds, timezone],
    )

    const { data: gmvData, isFetching: isGmvFetching } = useQuery({
        queryKey: gmvQueryKey,
        queryFn: async () => {
            const { filters } = getTimeFilters(storeIds)

            return await fetchMetricPerDimension(
                gmvQueryFactory(filters, timezone),
            )
        },
        enabled: hasStores,
        refetchInterval: REFETCH_INTERVAL_MS,
        staleTime: REFETCH_INTERVAL_MS,
        cacheTime: REFETCH_INTERVAL_MS,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const { currency: fallBackCurrency } = useCurrency()
    const currency =
        gmvInfluencedData?.data?.allData[0]?.[
            AiSalesAgentOrdersDimension.Currency
        ] ?? fallBackCurrency

    const reduceGmvTotal = (data?: ReportingMetricItem[]): number => {
        if (!data || !Array.isArray(data)) return 0

        return data.reduce((sum, row) => {
            const raw = row[AiSalesAgentOrdersMeasure.Gmv]
            return sum + (raw ? parseFloat(raw) : 0)
        }, 0)
    }

    const gmvInfluenced = useMemo(() => {
        return reduceGmvTotal(gmvInfluencedData?.data?.allData)
    }, [gmvInfluencedData])

    const gmvTotal = useMemo(() => {
        return reduceGmvTotal(gmvData?.data?.allData)
    }, [gmvData])

    const gmvInfluencedRate = useMemo(() => {
        return calculateRate(gmvInfluenced, gmvTotal)
    }, [gmvInfluenced, gmvTotal])

    return {
        gmvInfluenced: formatAmount(currency, gmvInfluenced),
        gmvInfluencedRate,
        isLoading: isGmvInfluencedFetching || isGmvFetching,
    }
}
