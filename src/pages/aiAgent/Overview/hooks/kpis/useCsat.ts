import { useMemo } from 'react'

import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import useAppSelector from 'hooks/useAppSelector'
import { TicketSatisfactionSurveyMeasure } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { customerSatisfactionQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import { FilterKey, StatsFilters, StatType } from 'models/stat/types'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { KpiMetric } from 'pages/aiAgent/Overview/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
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

    const aiAgentUserId = useAIAgentUserId()

    const result = useMultipleMetricsTrends(
        customerSatisfactionQueryFactory(
            {
                [FilterKey.Period]: filters.period,
                [FilterKey.Agents]: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [Number(aiAgentUserId)],
                },
            },
            timezone,
        ),
        customerSatisfactionQueryFactory(
            {
                [FilterKey.Period]: getPreviousPeriod(filters.period),
                [FilterKey.Agents]: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [Number(aiAgentUserId)],
                },
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
