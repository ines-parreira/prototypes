import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import useStatsMetricTrend from 'domains/reporting/hooks/useStatsMetricTrend'
import { TicketCustomFieldsMeasure } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { allAgentsAutomatedInteractionsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getStatsStoreIntegrations } from 'domains/reporting/state/stats/selectors'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useCsat } from 'pages/aiAgent/Overview/hooks/kpis/useCsat'
import { useGmvInfluenced } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced'
import type { AiAgentType } from 'pages/aiAgent/Overview/hooks/useAiAgentType'

import type { KpiMetric } from '../types'
import { useAiAgentTicketNoHandover } from './kpis/useAiAgentTicketNoHandover'

export const useAiAgentAutomationTickets = (
    filters: StatsFilters,
    timezone: string,
    v1IntegrationIds?: string[],
    v2IntegrationIds?: number[],
): KpiMetric => {
    const { value: isNewScreens, isLoading: isFlagLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens)
    const useV2 = !isFlagLoading && !!isNewScreens
    const useV1 = !isFlagLoading && !isNewScreens

    const v1 = useAiAgentTicketNoHandover(
        filters,
        timezone,
        v1IntegrationIds,
        useV1,
    )

    const storeFilter = v2IntegrationIds?.length
        ? { storeIntegrations: withLogicalOperator(v2IntegrationIds) }
        : {}
    const filtersWithStore = { ...filters, ...storeFilter }
    const v2 = useStatsMetricTrend(
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: filtersWithStore,
            timezone,
        }),
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: {
                ...filtersWithStore,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
        useV2,
    )

    const isFetching = isFlagLoading || (useV2 ? v2.isFetching : v1.isFetching)
    const value = useV2
        ? (v2.data?.value ?? null)
        : (v1.data?.[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]
              ?.value ?? null)
    const prevValue = useV2
        ? (v2.data?.prevValue ?? null)
        : (v1.data?.[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]
              ?.prevValue ?? null)

    return {
        title: 'Automated interactions',
        hint: {
            title: 'Interactions AI Agent resolved from start to finish, with no human agent involved.',
        },
        metricFormat: 'decimal-precision-1',
        isLoading: isFetching,
        'data-candu-id': 'ai-agent-overview-kpi-automation-tickets',
        hidden: false,
        prevValue,
        value,
    }
}

export const useKpis = ({
    automationRateFilters: initialAutomationRateFilters,
    filters: initialFilters,
    timezone,
    aiAgentType,
    aiAgentUserId,
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
    shopName,
}: {
    automationRateFilters: StatsFilters
    filters: StatsFilters
    timezone: string
    aiAgentType?: AiAgentType
    aiAgentUserId: number
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
    shopName?: string
}) => {
    const storeIntegrationIds = useGetTicketChannelsStoreIntegrations(
        shopName || '',
    )
    const storeIntegrations = useAppSelector(getStatsStoreIntegrations)
    const gmvIntegrationIds = storeIntegrations
        .filter((s) => s.name === shopName)
        .map((s) => s.id)

    const automationRateFilters = {
        ...initialAutomationRateFilters,
        [FilterKey.Agents]: {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [aiAgentUserId],
        },
    }
    const filters = {
        ...initialFilters,
        [FilterKey.Agents]: {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [aiAgentUserId],
        },
    }

    const automatedInteractions = useAiAgentAutomationTickets(
        automationRateFilters,
        timezone,
        storeIntegrationIds,
        gmvIntegrationIds,
    )
    const gmvInfluenced = useGmvInfluenced({
        filters: filters,
        timezone: timezone,
        aiAgentType: aiAgentType,
        isOnNewPlan: isOnNewPlan,
        showEarlyAccessModal: showEarlyAccessModal,
        showActivationModal: showActivationModal,
        integrationIds: gmvIntegrationIds,
    })
    const csat = useCsat(
        filters,
        timezone,
        aiAgentUserId,
        storeIntegrationIds,
        gmvIntegrationIds,
    )

    return {
        metrics: [automatedInteractions, csat, gmvInfluenced],
    }
}
