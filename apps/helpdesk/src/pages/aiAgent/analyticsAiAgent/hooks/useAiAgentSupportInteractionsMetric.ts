import type { MetricTrend } from '@repo/reporting'

import { useSupportInteractionsTotal } from 'domains/reporting/hooks/ai-agent-insights/supportInteractionsMetrics'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export const useAiAgentSupportInteractionsMetric = (): MetricTrend & {
    isFieldsAvailable: boolean
} => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const isFieldsAvailable =
        outcomeCustomFieldId !== TICKET_FIELD_ID_NOT_AVAILABLE &&
        intentCustomFieldId !== TICKET_FIELD_ID_NOT_AVAILABLE

    const {
        isFetching: isFetchingCurrent,
        isError: isErrorCurrent,
        data: currentData,
    } = useSupportInteractionsTotal(
        statsFilters,
        userTimezone,
        outcomeCustomFieldId,
        intentCustomFieldId,
    )

    const previousPeriodFilters = {
        ...statsFilters,
        period: getPreviousPeriod(statsFilters.period),
    }
    const {
        isFetching: isFetchingPrev,
        isError: isErrorPrev,
        data: prevData,
    } = useSupportInteractionsTotal(
        previousPeriodFilters,
        userTimezone,
        outcomeCustomFieldId,
        intentCustomFieldId,
    )

    return {
        isFetching: isFetchingCurrent || isFetchingPrev,
        isError: isErrorCurrent || isErrorPrev,
        isFieldsAvailable,
        data: {
            label: 'Automated interactions',
            value: currentData?.value ?? null,
            prevValue: prevData?.value ?? null,
        },
    }
}
