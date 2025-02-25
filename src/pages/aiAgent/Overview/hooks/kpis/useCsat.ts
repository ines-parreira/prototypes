import { useMemo } from 'react'

import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import useAppSelector from 'hooks/useAppSelector'
import { TicketSatisfactionSurveyMeasure } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { customerSatisfactionMetricPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import { StatsFilters, StatType } from 'models/stat/types'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { KpiMetric } from 'pages/aiAgent/Overview/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getStoreIntegrations } from 'state/integrations/selectors'
import { getPreviousPeriod } from 'utils/reporting'

export const useCsat = (filters: StatsFilters, timezone: string): KpiMetric => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const stores = useAppSelector(getStoreIntegrations)
    const storesName = useMemo(
        () => stores.map((store) => store.name),
        [stores],
    )

    const { isLoading: storeConfigurationsLoading, storeConfigurations } =
        useStoreConfigurationForAccount({
            accountDomain,
            storesName,
        })

    const hasEmailAgentEnabled = useMemo(
        () =>
            storeConfigurations?.some(
                (it) => it.emailChannelDeactivatedDatetime === null,
            ),
        [storeConfigurations],
    )

    const result = useMultipleMetricsTrends(
        customerSatisfactionMetricPerAgentQueryFactory(filters, timezone),
        customerSatisfactionMetricPerAgentQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

    return {
        hidden: !hasEmailAgentEnabled,
        title: 'CSAT (Customer Satisfaction Score)',
        hint: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
        metricType: StatType.Number,
        metricFormat: 'decimal',
        isLoading: result.isFetching || storeConfigurationsLoading,
        ...result.data?.[TicketSatisfactionSurveyMeasure.AvgSurveyScore],
    }
}
