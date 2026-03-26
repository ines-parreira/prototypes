import { useMemo } from 'react'

import { CUSTOM_FIELD_AI_AGENT_HANDOVER } from 'domains/reporting/hooks/automate/types'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import { aggregateIntentMetrics } from 'domains/reporting/models/queryFactories/intents/intentInsightsMetrics'
import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { getTimezone } from 'state/currentUser/selectors'

import type { IntentMetrics } from '../components/IntentsTable/useIntentsTable'
import { useTotalAiAgentTickets } from './useTotalAiAgentTickets'

/**
 * Hook to fetch resource metrics for all intents.
 * Fetches metrics for the last 28 days filtered by shopIntegrationId:
 * - Number of tickets where this intent was used
 * - Number of handover tickets
 * - Percent of tickets (ticket volume %) = ticket volume / total AI agent tickets
 * - Percent of handover = handover / ticket volume
 */
export const useIntentsMetrics = (enabled: boolean = true) => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const shopName = storeConfiguration?.storeName || ''
    const timezone = useAppSelector(getTimezone)
    const {
        intentCustomFieldId,
        outcomeCustomFieldId,
        isLoading: isCustomFieldsLoading,
    } = useGetCustomTicketsFieldsDefinitionData()

    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)
    const metricsDateRange = useMemo(() => getLast28DaysDateRange(), [])

    const filters = useMemo(
        () => ({
            [FilterKey.Period]: metricsDateRange,
        }),
        [metricsDateRange],
    )

    const tz = timezone ?? 'UTC'
    const isQueryEnabled =
        enabled && !!intentCustomFieldId && !!outcomeCustomFieldId

    const totalMetric = useMetricPerDimensionV2(
        aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory({
            filters,
            timezone: tz,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
            integrationIds,
        }),
        undefined,
        undefined,
        isQueryEnabled && !isCustomFieldsLoading,
    )

    const handoverMetric = useMetricPerDimensionV2(
        aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory({
            filters,
            timezone: tz,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
            integrationIds,
            outcomeValueToInclude: CUSTOM_FIELD_AI_AGENT_HANDOVER,
        }),
        undefined,
        undefined,
        isQueryEnabled && !isCustomFieldsLoading,
    )

    const { totalCount: totalAiAgentTickets } = useTotalAiAgentTickets()

    const isLoading = totalMetric.isFetching || handoverMetric.isFetching
    const isError = totalMetric.isError || handoverMetric.isError

    const metricsMap = useMemo(() => {
        if (isLoading || isError) {
            return new Map<string, IntentMetrics>()
        }

        return aggregateIntentMetrics(
            totalMetric.data?.allData,
            handoverMetric.data?.allData,
            totalAiAgentTickets,
        )
    }, [
        isLoading,
        isError,
        totalMetric.data,
        handoverMetric.data,
        totalAiAgentTickets,
    ])

    return {
        data: metricsMap,
        isLoading,
        isError,
        metricsDateRange,
    }
}
