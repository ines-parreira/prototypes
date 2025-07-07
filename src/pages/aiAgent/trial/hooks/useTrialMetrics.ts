import { useMemo } from 'react'

import moment from 'moment'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { ReportingGranularity } from 'models/reporting/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useGmvUsdOverTimeSeries } from 'pages/stats/automate/aiSalesAgent/metrics/useGmvUsdOverTimeSeries'
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
            from: now.clone().subtract(30, 'd').toISOString(),
            to: now.toISOString(),
        }
    }, [])

    const { data, isLoading } = useGmvUsdOverTimeSeries(
        {
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
        },
        timezone,
        ReportingGranularity.Day,
    )

    const remainingDays = useMemo(() => {
        if (!storeActivations) {
            return 0
        }

        const remainingDays = Object.values(storeActivations)
            .map((storeConfig) => {
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
    }, [storeActivations])

    const gmv = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return 0
        }

        const timeSeriesData = data[0]
        if (!Array.isArray(timeSeriesData)) {
            return 0
        }

        return timeSeriesData.reduce((acc, curr) => acc + (curr.value || 0), 0)
    }, [data])

    return {
        remainingDays,
        gmv,
        isLoading,
    }
}
