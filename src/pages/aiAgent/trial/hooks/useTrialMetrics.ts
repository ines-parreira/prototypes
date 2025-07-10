import { useMemo } from 'react'

import moment from 'moment'

import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { IntegrationType } from 'models/integration/constants'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { gmvInfluencedQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getShoppingAssistantExpirationDays } from 'pages/aiAgent/components/AiShoppingAssistantExpireBanner/AiShoppingAssistantExpireBanner'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { formatAmount } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils'
import { useGmvInfluencedRateTrend } from 'pages/stats/automate/aiSalesAgent/metrics/useGmvInfluencedRateTrend'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { getTimezone } from 'state/currentUser/selectors'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

export const useTrialMetrics = () => {
    const storeIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )
    const trialMilestone = useSalesTrialRevampMilestone()

    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'
    const { storeActivations } = useStoreActivations()

    const storeIds = useMemo(() => {
        if (!storeActivations) {
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

    // TODO: DOUBLE CHECK THIS
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

    const currentPeriodQuery = useMemo(
        () => gmvInfluencedQueryFactory(filters, timezone),
        [filters, timezone],
    )

    const { data: gmvInfluencedData, isFetching: isGmvInfluencedFetching } =
        useMetricPerDimension(currentPeriodQuery)

    const { data: gmvInfluencedRate, isFetching: isGmvInfluencedRateFetching } =
        useGmvInfluencedRateTrend(filters, timezone)

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
            !gmvInfluencedData.allData ||
            !Array.isArray(gmvInfluencedData.allData)
        ) {
            return 0
        }

        return gmvInfluencedData.allData.reduce((acc, curr) => {
            const gmvValue = curr[AiSalesAgentOrdersMeasure.Gmv]
            return acc + (gmvValue ? parseFloat(gmvValue) : 0)
        }, 0)
    }, [gmvInfluencedData])

    return {
        remainingDays,
        trialEndTime,
        gmvInfluenced: formatAmount(currency, gmvInfluenced),
        gmvInfluencedRate: gmvInfluencedRate?.value || 0,
        isLoading: isGmvInfluencedFetching || isGmvInfluencedRateFetching,
    }
}
