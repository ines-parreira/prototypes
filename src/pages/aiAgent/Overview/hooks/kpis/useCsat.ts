import { useMemo } from 'react'

import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { customerSatisfactionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { FilterKey, StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { KpiMetric } from 'pages/aiAgent/Overview/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getStoreIntegrations } from 'state/integrations/selectors'

export const useCsat = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number,
): KpiMetric => {
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
        customerSatisfactionQueryFactory(
            {
                [FilterKey.Period]: filters.period,
                [FilterKey.Agents]: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [aiAgentUserId],
                },
            },
            timezone,
        ),
        customerSatisfactionQueryFactory(
            {
                [FilterKey.Period]: getPreviousPeriod(filters.period),
                [FilterKey.Agents]: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [aiAgentUserId],
                },
            },
            timezone,
        ),
    )

    return {
        hidden: !hasEmailAgentEnabled,
        title: 'CSAT',
        hint: {
            title: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
        },
        metricFormat: 'decimal-precision-1',
        isLoading: result.isFetching || storeConfigurationsLoading,
        'data-candu-id': 'ai-agent-overview-kpi-csat',
        ...result.data?.[TicketSatisfactionSurveyMeasure.AvgSurveyScore],
    }
}
