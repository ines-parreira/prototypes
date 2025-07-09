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

    const isRevampTrialMilestone0Enabled = trialMilestone === 'milestone-0'
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

        return {
            from: now.clone().subtract(14, 'd').toISOString(),
            to: now.toISOString(),
        }
    }, [])

    const filters = {
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
    }

    const currentPeriodQuery = gmvInfluencedQueryFactory(filters, timezone)

    const { data: gmvInfluencedData, isFetching: isGmvInfluencedFetching } =
        useMetricPerDimension(currentPeriodQuery)

    const { data: gmvInfluencedRate, isFetching: isGmvInfluencedRateFetching } =
        useGmvInfluencedRateTrend(filters, timezone)

    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate

    const currency = currentPlan?.currency ?? 'USD'

    const remainingDays = useMemo(() => {
        if (!storeActivations) {
            return 0
        }

        const remainingDays = Object.values(storeActivations)
            .map((storeConfig) => {
                if (isRevampTrialMilestone0Enabled) {
                    return (
                        getShoppingAssistantExpirationDays(
                            storeConfig.configuration.salesDeactivatedDatetime,
                        ) || Infinity
                    )
                }
                const trialStartDatetime =
                    storeConfig.configuration.sales?.trial.startDatetime
                const trialEndDatetime =
                    storeConfig.configuration.sales?.trial.endDatetime
                if (!trialStartDatetime || !trialEndDatetime) {
                    return Infinity
                }
                const trialStartDate = moment(trialStartDatetime)
                const trialEndDate = moment(trialEndDatetime)
                const days = Math.round(
                    trialEndDate.diff(trialStartDate, 'days', true),
                )
                return days
            })
            .filter((days) => days !== Infinity)

        return remainingDays.length > 0 ? Math.min(...remainingDays) : 0
    }, [storeActivations, isRevampTrialMilestone0Enabled])

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
        gmvInfluenced: formatAmount(currency, gmvInfluenced),
        gmvInfluencedRate: gmvInfluencedRate?.value || 0,
        isLoading: isGmvInfluencedFetching || isGmvInfluencedRateFetching,
    }
}
