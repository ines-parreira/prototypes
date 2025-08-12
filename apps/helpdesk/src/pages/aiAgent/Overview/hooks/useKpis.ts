import { TicketCustomFieldsMeasure } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { FilterKey, StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getStatsStoreIntegrations } from 'domains/reporting/state/stats/selectors'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { useCoverageRate } from 'pages/aiAgent/Overview/hooks/kpis/useCoverageRate'
import { useCsat } from 'pages/aiAgent/Overview/hooks/kpis/useCsat'
import { useGmvInfluenced } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced'
import { AiAgentType } from 'pages/aiAgent/Overview/hooks/useAiAgentType'

import { KpiMetric } from '../types'
import { useAiAgentTicketNoHandover } from './kpis/useAiAgentTicketNoHandover'

export const useAiAgentAutomationTickets = (
    filters: StatsFilters,
    timezone: string,
    integrationIds?: string[],
): KpiMetric => {
    const aiAgentTicketNoHandover = useAiAgentTicketNoHandover(
        filters,
        timezone,
        integrationIds,
    )

    const data =
        aiAgentTicketNoHandover.data[
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        ]

    return {
        title: 'AI Agent automated interactions',
        hint: {
            title: 'Interactions fully resolved by AI Agent without human intervention.',
        },
        metricFormat: 'decimal-precision-1',
        isLoading: aiAgentTicketNoHandover.isFetching,
        'data-candu-id': 'ai-agent-overview-kpi-automation-tickets',
        hidden: false,
        prevValue: data.prevValue,
        value: data.value,
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
    isActionDrivenAiAgentNavigationEnabled,
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
    isActionDrivenAiAgentNavigationEnabled?: boolean
}) => {
    // Always call the hook to avoid conditional hook issue
    const storeIntegrationIds = useGetTicketChannelsStoreIntegrations(
        shopName || '',
    )
    // For GMV we need to use the integration ids from the store integrations
    const storeIntegrations = useAppSelector(getStatsStoreIntegrations)
    const gmvIntegrationIds =
        isActionDrivenAiAgentNavigationEnabled && shopName
            ? storeIntegrations
                  .filter((s) => s.name === shopName)
                  .map((s) => s.id)
            : undefined
    // Only use the integrations when shopName is provided and feature flag is enabled
    const integrationIds =
        isActionDrivenAiAgentNavigationEnabled && shopName
            ? storeIntegrationIds
            : undefined

    const automationRateFilters = { ...initialAutomationRateFilters }
    const filters = { ...initialFilters }

    if (isActionDrivenAiAgentNavigationEnabled) {
        automationRateFilters[FilterKey.Agents] = {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [aiAgentUserId],
        }
        filters[FilterKey.Agents] = {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [aiAgentUserId],
        }
    }

    const coverageRate = useCoverageRate(
        automationRateFilters,
        timezone,
        integrationIds,
    )
    const automationRate = useAiAgentAutomationRate(
        automationRateFilters,
        timezone,
        integrationIds,
    )
    const automatedInteractions = useAiAgentAutomationTickets(
        automationRateFilters,
        timezone,
        integrationIds,
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
    const csat = useCsat(filters, timezone, aiAgentUserId, integrationIds)

    let metrics = [coverageRate, automationRate, gmvInfluenced, csat]
    if (isActionDrivenAiAgentNavigationEnabled) {
        metrics = [automatedInteractions, csat, gmvInfluenced]
    }

    return {
        metrics,
    }
}
