import type { ChartDataItem } from '@repo/reporting'

import { useSupportInteractionsPerIntent } from 'domains/reporting/hooks/ai-agent-insights/supportInteractionsMetrics'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export const useSupportInteractionsByIntent = (): {
    data: ChartDataItem[] | undefined
    isLoading: boolean
    isError: boolean
    isFieldsAvailable: boolean
} => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const isFieldsAvailable =
        outcomeCustomFieldId !== TICKET_FIELD_ID_NOT_AVAILABLE &&
        intentCustomFieldId !== TICKET_FIELD_ID_NOT_AVAILABLE

    const {
        data: intentData,
        isFetching,
        isError,
    } = useSupportInteractionsPerIntent(
        cleanStatsFilters,
        userTimezone,
        outcomeCustomFieldId,
        intentCustomFieldId,
    )

    if (!isFieldsAvailable || !intentData?.allData) {
        return {
            data: undefined,
            isLoading: isFetching,
            isError,
            isFieldsAvailable,
        }
    }

    const mapped = intentData.allData.map((item) => ({
        name: item[
            TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue
        ] as string,
        value:
            Number(
                item[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
            ) || 0,
    }))

    const chartData: ChartDataItem[] = mapped
        .filter((item) => item.value > 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0))

    return {
        data: chartData,
        isLoading: isFetching,
        isError,
        isFieldsAvailable,
    }
}
