import { useMemo } from 'react'

import { useMetric } from 'domains/reporting/hooks/useMetric'
import { allTicketsForAiAgentTotalCountQueryFactory } from 'domains/reporting/models/queryFactories/ai-agent-insights/metrics'
import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { getTimezone } from 'state/currentUser/selectors'

/**
 * Hook to fetch total AI Agent tickets count
 * Used for calculating percentage metrics in the Skills Table
 */
export const useTotalAiAgentTickets = () => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const shopName = storeConfiguration?.storeName || ''
    const timezone = useAppSelector(getTimezone)
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)
    const metricsDateRange = useMemo(() => getLast28DaysDateRange(), [])

    const filters = useMemo(
        () => ({
            [FilterKey.Period]: metricsDateRange,
        }),
        [metricsDateRange],
    )

    const query = useMemo(
        () =>
            allTicketsForAiAgentTotalCountQueryFactory({
                filters,
                timezone: timezone ?? 'UTC',
                intentFieldId: intentCustomFieldId,
                outcomeFieldId: outcomeCustomFieldId,
                integrationIds,
            }),
        [
            filters,
            timezone,
            intentCustomFieldId,
            outcomeCustomFieldId,
            integrationIds,
        ],
    )

    const { data, isFetching, isError } = useMetric(
        query,
        undefined,
        !!intentCustomFieldId && !!outcomeCustomFieldId,
    )

    const totalCount = useMemo(() => {
        if (!data?.value) return 0
        return data.value
    }, [data])

    return {
        totalCount,
        isLoading: isFetching,
        isError,
    }
}
