import { useMemo } from 'react'

import { useMetric } from 'domains/reporting/hooks/useMetric'
import { aiAgentTouchedTicketTotalCountQueryFactory } from 'domains/reporting/models/queryFactories/ai-agent-insights/metrics'
import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { getTimezone } from 'state/currentUser/selectors'

/**
 * Hook to fetch total covered AI Agent tickets count (tickets with any outcome set).
 * Used as the denominator for ticket volume % in the Intents Table so merchants can see
 * "out of covered tickets, how much volume does this intent represent".
 */
export const useTotalCoveredAiAgentTickets = () => {
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
            aiAgentTouchedTicketTotalCountQueryFactory({
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
