import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import moment from 'moment'
import { shallowEqual } from 'react-redux'

import {
    fetchMetricPerDimension,
    ReportingMetricItem,
} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { IntegrationType } from 'models/integration/constants'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { reportingKeys } from 'models/reporting/queries'
import { gmvInfluencedQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getShoppingAssistantExpirationDays } from 'pages/aiAgent/components/AiShoppingAssistantExpireBanner/AiShoppingAssistantExpireBanner'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { formatAmount } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { getTimezone } from 'state/currentUser/selectors'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

export type TrialMetrics = {
    remainingDays: number
    trialEndTime: string | null
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
    const trialMilestone = useSalesTrialRevampMilestone()

    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'
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

    const { remainingDays, trialEndTime } = useMemo(() => {
        if (!storeActivations) {
            return { remainingDays: 0, trialEndTime: null }
        }

        // Use the stable 'to' date we already calculated above
        const now = moment(to)

        const trialData = Object.values(storeActivations)
            .map((storeConfig) => {
                if (isRevampTrialMilestone1Enabled) {
                    const trialStartDatetime =
                        storeConfig.configuration.sales?.trial.startDatetime
                    const trialEndDatetime =
                        storeConfig.configuration.sales?.trial.endDatetime

                    if (!trialStartDatetime || !trialEndDatetime) {
                        return { days: Infinity, endTime: null }
                    }

                    const trialEndDate = moment(trialEndDatetime)
                    const days = Math.max(
                        0,
                        Math.round(trialEndDate.diff(now, 'days', true)),
                    )

                    return { days, endTime: trialEndDate.toISOString() }
                }

                const salesDeactivatedDatetime =
                    storeConfig.configuration.salesDeactivatedDatetime
                if (!salesDeactivatedDatetime) {
                    return { days: Infinity, endTime: null }
                }

                const deactivatedDate = moment(salesDeactivatedDatetime)
                const days =
                    getShoppingAssistantExpirationDays(
                        salesDeactivatedDatetime,
                    ) || Infinity

                return { days, endTime: deactivatedDate.toISOString() }
            })
            .filter((data) => data.days !== Infinity)

        const minDaysData =
            trialData.length > 0
                ? trialData.reduce((min, current) =>
                      current.days < min.days ? current : min,
                  )
                : { days: 0, endTime: null }

        return {
            remainingDays: minDaysData.days,
            trialEndTime: minDaysData.endTime,
        }
    }, [storeActivations, isRevampTrialMilestone1Enabled, to])

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
        remainingDays,
        trialEndTime,
        gmvInfluenced: formatAmount(currency, gmvInfluenced),
        gmvInfluencedRate: gmvInfluencedRateData?.value || 0,
        isLoading: isGmvInfluencedFetching || isGmvInfluencedRateFetching,
    }
}
