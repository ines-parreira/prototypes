import { useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import { useStatsMetricTrend } from 'domains/reporting/hooks/useStatsMetricTrend'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import {
    customerSatisfactionForAIAgentTicketsQueryFactory,
    customerSatisfactionQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { averageAiAgentCsatQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentCsat'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useAppSelector } from 'hooks/useAppSelector'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import type { KpiMetric } from 'pages/aiAgent/Overview/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getStoreIntegrations } from 'state/integrations/selectors'

export const useCsat = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number,
    integrationIds?: string[],
    v2IntegrationIds?: number[],
): KpiMetric => {
    const { value: isNewScreens, isLoading: isFlagLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens)
    const useV2 = !isFlagLoading && !!isNewScreens
    const useV1 = !isFlagLoading && !isNewScreens

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const stores = useAppSelector(getStoreIntegrations)
    const storesName = useMemo(
        () => stores.map((store) => store.name),
        [stores],
    )

    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

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

    // V1 path
    const useIntegrationFilter = integrationIds && integrationIds.length > 0

    const currentPeriodQuery = useIntegrationFilter
        ? customerSatisfactionForAIAgentTicketsQueryFactory({
              filters,
              timezone,
              aiAgentUserId,
              integrationIds,
              intentFieldId: intentCustomFieldId,
              outcomeFieldId: outcomeCustomFieldId,
          })
        : customerSatisfactionQueryFactory(
              {
                  [FilterKey.Period]: filters.period,
                  [FilterKey.Agents]: {
                      operator: LogicalOperatorEnum.ONE_OF,
                      values: [aiAgentUserId],
                  },
              },
              timezone,
          )

    const previousPeriodQuery = useIntegrationFilter
        ? customerSatisfactionForAIAgentTicketsQueryFactory({
              filters: {
                  ...filters,
                  period: getPreviousPeriod(filters.period),
              },
              timezone,
              aiAgentUserId,
              integrationIds,
              intentFieldId: intentCustomFieldId,
              outcomeFieldId: outcomeCustomFieldId,
          })
        : customerSatisfactionQueryFactory(
              {
                  [FilterKey.Period]: getPreviousPeriod(filters.period),
                  [FilterKey.Agents]: {
                      operator: LogicalOperatorEnum.ONE_OF,
                      values: [aiAgentUserId],
                  },
              },
              timezone,
          )

    const v1Result = useMultipleMetricsTrends(
        currentPeriodQuery,
        previousPeriodQuery,
        undefined,
        undefined,
        useV1,
    )

    // V2 path
    const storeFilter = v2IntegrationIds?.length
        ? { storeIntegrations: withLogicalOperator(v2IntegrationIds) }
        : {}
    const v2Filters = { ...filters, ...storeFilter }

    const v2 = useStatsMetricTrend(
        averageAiAgentCsatQueryV2Factory({ filters: v2Filters, timezone }),
        averageAiAgentCsatQueryV2Factory({
            filters: {
                ...v2Filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
        useV2,
    )

    const isFetching = useV2 ? v2.isFetching : v1Result.isFetching
    const value = useV2
        ? (v2.data?.value ?? null)
        : (v1Result.data?.[TicketSatisfactionSurveyMeasure.AvgSurveyScore]
              ?.value ?? null)
    const prevValue = useV2
        ? (v2.data?.prevValue ?? null)
        : (v1Result.data?.[TicketSatisfactionSurveyMeasure.AvgSurveyScore]
              ?.prevValue ?? null)

    return {
        hidden: !hasEmailAgentEnabled,
        title: 'Average CSAT',
        hint: {
            title: 'Average satisfaction (CSAT) score for interactions handled during the selected period.',
        },
        metricFormat: 'decimal-precision-1',
        isLoading: isFlagLoading || isFetching || storeConfigurationsLoading,
        'data-candu-id': 'ai-agent-overview-kpi-csat',
        value,
        prevValue,
    }
}
