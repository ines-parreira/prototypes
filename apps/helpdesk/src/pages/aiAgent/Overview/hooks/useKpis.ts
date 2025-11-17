import { TicketCustomFieldsMeasure } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getStatsStoreIntegrations } from 'domains/reporting/state/stats/selectors'
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
    // Always call the hook to avoid conditional hook issue
    const storeIntegrationIds = useGetTicketChannelsStoreIntegrations(
        shopName || '',
    )
    // For GMV we need to use the integration ids from the store integrations
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
    const csat = useCsat(filters, timezone, aiAgentUserId, storeIntegrationIds)

    return {
        metrics: [automatedInteractions, csat, gmvInfluenced],
    }
}
