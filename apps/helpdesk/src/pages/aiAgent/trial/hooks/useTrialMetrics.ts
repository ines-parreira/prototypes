import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import moment from 'moment'
import { shallowEqual } from 'react-redux'

import type { ReportingMetricItem } from 'domains/reporting/hooks/types'
import { fetchMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    gmvInfluencedQueryFactory,
    gmvQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import {
    AISalesAgentGMVInfluencedQueryFactoryV2,
    AISalesAgentGMVQueryFactoryV2,
} from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { calculateRate } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import { getTimeFilters } from 'pages/aiAgent/trial/utils/getTimeFilters'
import { formatAmount } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils'
import { getTimezone } from 'state/currentUser/selectors'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

export type TrialMetrics = {
    gmvInfluenced: string
    gmvInfluencedRate: number
    isLoading: boolean
    automationRate?: {
        value: number
        prevValue: number
        isLoading: boolean
    }
}

const REFETCH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export const useTrialMetrics = (
    trialType: TrialType,
    shopName?: string,
): TrialMetrics => {
    const storeIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
        shallowEqual,
    )
    const { storeActivations } = useStoreActivations(
        shopName ? { storeName: shopName } : undefined,
    )

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
                return await fetchMetricPerDimensionV2(
                    currentPeriodQuery,
                    AISalesAgentGMVInfluencedQueryFactoryV2({
                        filters,
                        timezone,
                    }),
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

    const gmvQueryKey = useMemo(
        () => ['trial-metrics', 'gmv', storeIds, timezone],
        [storeIds, timezone],
    )

    const { data: gmvData, isFetching: isGmvFetching } = useQuery({
        queryKey: gmvQueryKey,
        queryFn: async () => {
            const { filters } = getTimeFilters(storeIds)

            return await fetchMetricPerDimensionV2(
                gmvQueryFactory(filters, timezone),
                AISalesAgentGMVQueryFactoryV2({ filters, timezone }),
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
    const currency = (gmvInfluencedData?.data?.allData[0]?.[
        AiSalesAgentOrdersDimension.Currency
    ] ?? fallBackCurrency) as string

    const reduceGmvTotal = (data?: ReportingMetricItem[]): number => {
        if (!data || !Array.isArray(data)) return 0

        return data.reduce((sum, row) => {
            const raw = row[AiSalesAgentOrdersMeasure.Gmv]
            const floatRow = typeof raw === 'string' ? parseFloat(raw) : raw
            return sum + (floatRow ?? 0)
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

    const trialStartDate = useMemo(() => {
        if (!storeActivations || !shopName) return null

        const storeActivation = storeActivations[shopName]
        if (!storeActivation) return null

        const trialConfig =
            trialType === TrialType.AiAgent
                ? storeActivation.configuration.trial
                : null

        return trialConfig?.startDatetime || null
    }, [storeActivations, shopName, trialType])

    const automationRateFilters = useMemo((): StatsFilters => {
        if (!trialStartDate) {
            /**
             * If the trial start date is not available, we will fallback to the start of the day and end of the day
             * Period is required in useAiAgentAutomationRate hook
             * If there is no trial start date, trial metrics won't be presented to the user in UI - modals containing trial metrics won't be shown
             */
            return {
                period: {
                    start_datetime: moment().startOf('day').format(),
                    end_datetime: moment().endOf('day').format(),
                },
            }
        }

        return {
            period: {
                start_datetime: moment(trialStartDate).startOf('day').format(),
                end_datetime: moment().endOf('day').format(),
            },
        }
    }, [trialStartDate])

    const automationRateData = useAiAgentAutomationRate(
        automationRateFilters,
        timezone,
        undefined,
    )

    return {
        gmvInfluenced: formatAmount(currency, gmvInfluenced),
        gmvInfluencedRate,
        isLoading:
            isGmvInfluencedFetching ||
            isGmvFetching ||
            automationRateData.isLoading,
        automationRate:
            automationRateFilters &&
            trialType === TrialType.AiAgent &&
            trialStartDate
                ? {
                      value: automationRateData.value || 0,
                      prevValue: automationRateData.prevValue || 0,
                      isLoading: automationRateData.isLoading,
                  }
                : undefined,
    }
}
