import { useMemo } from 'react'

import {
    useHandoverInteractionsPerIntent,
    useSnoozedInteractionsPerIntent,
    useTotalInteractionsPerIntent,
} from 'domains/reporting/hooks/ai-agent-insights/intentMetrics'
import { getIntentByLevel } from 'domains/reporting/hooks/automate/utils'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

const INTENT_LEVEL = 2

export type IntentMetrics = {
    intentL1: string
    intentL2: string
    handoverInteractions: number | null
    snoozedInteractions: number | null
    successRate: number | null
    costSaved: number | null
}

export type IntentPerformanceMetrics = {
    data: IntentMetrics[]
    isLoading: boolean
    isError: boolean
    loadingStates: {
        handoverInteractions: boolean
        snoozedInteractions: boolean
        successRate: boolean
        costSaved: boolean
    }
}

const parseIntentLevels = (
    intentString: string,
): { l1: string; l2: string } => {
    const parts = intentString.split('::')
    return {
        l1: parts[0]?.trim() || '',
        l2: parts[1]?.trim() || '',
    }
}

export const useIntentPerformanceMetrics = (
    filters: StatsFilters,
    timezone: string,
): IntentPerformanceMetrics => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const handoverPerIntent = useHandoverInteractionsPerIntent(
        filters,
        timezone,
        outcomeCustomFieldId,
        intentCustomFieldId,
    )

    const snoozedPerIntent = useSnoozedInteractionsPerIntent(
        filters,
        timezone,
        outcomeCustomFieldId,
        intentCustomFieldId,
    )

    const totalPerIntent = useTotalInteractionsPerIntent(
        filters,
        timezone,
        outcomeCustomFieldId,
        intentCustomFieldId,
    )

    const isLoading =
        handoverPerIntent.isFetching ||
        snoozedPerIntent.isFetching ||
        totalPerIntent.isFetching

    const data = useMemo(() => {
        const handoverMap = new Map<string, number>()
        const snoozedMap = new Map<string, number>()
        const totalMap = new Map<string, number>()

        handoverPerIntent.data?.allData.forEach((item) => {
            const intentValue =
                item[TicketCustomFieldsDimension.TicketCustomFieldsValueString]
            const count =
                item[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]

            if (count != null && intentValue) {
                const numericCount =
                    typeof count === 'string' ? parseFloat(count) : count

                const intentAtLevel = getIntentByLevel(
                    String(intentValue),
                    INTENT_LEVEL,
                )
                const existing = handoverMap.get(intentAtLevel) || 0
                handoverMap.set(intentAtLevel, existing + numericCount)
            }
        })

        snoozedPerIntent.data?.allData.forEach((item) => {
            const intentValue =
                item[TicketCustomFieldsDimension.TicketCustomFieldsValueString]
            const count =
                item[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]

            if (count != null && intentValue) {
                const numericCount =
                    typeof count === 'string' ? parseFloat(count) : count

                const intentAtLevel = getIntentByLevel(
                    String(intentValue),
                    INTENT_LEVEL,
                )
                const existing = snoozedMap.get(intentAtLevel) || 0
                snoozedMap.set(intentAtLevel, existing + numericCount)
            }
        })

        totalPerIntent.data?.allData.forEach((item) => {
            const intentValue =
                item[TicketCustomFieldsDimension.TicketCustomFieldsValueString]
            const count =
                item[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]

            if (count != null && intentValue) {
                const numericCount =
                    typeof count === 'string' ? parseFloat(count) : count

                const intentAtLevel = getIntentByLevel(
                    String(intentValue),
                    INTENT_LEVEL,
                )
                const existing = totalMap.get(intentAtLevel) || 0
                totalMap.set(intentAtLevel, existing + numericCount)
            }
        })

        const allIntentKeys = new Set([
            ...handoverMap.keys(),
            ...snoozedMap.keys(),
            ...totalMap.keys(),
        ])

        const result: IntentMetrics[] = Array.from(allIntentKeys).map(
            (intentKey) => {
                const { l1, l2 } = parseIntentLevels(intentKey)
                const handoverInteractions = handoverMap.get(intentKey) ?? 0
                const snoozedInteractions = snoozedMap.get(intentKey) ?? 0
                const totalInteractions = totalMap.get(intentKey) ?? 0
                const automatedInteractions =
                    totalInteractions - handoverInteractions
                const successRate =
                    totalInteractions > 0
                        ? (automatedInteractions / totalInteractions) * 100
                        : null

                const costSaved =
                    automatedInteractions * costSavedPerInteraction

                return {
                    intentL1: l1,
                    intentL2: l2,
                    handoverInteractions:
                        handoverInteractions > 0 ? handoverInteractions : null,
                    snoozedInteractions:
                        snoozedInteractions > 0 ? snoozedInteractions : null,
                    successRate,
                    costSaved,
                }
            },
        )

        return result
    }, [
        handoverPerIntent.data,
        snoozedPerIntent.data,
        totalPerIntent.data,
        costSavedPerInteraction,
    ])

    const loadingStates = useMemo(
        () => ({
            handoverInteractions: handoverPerIntent.isFetching,
            snoozedInteractions: snoozedPerIntent.isFetching,
            successRate:
                handoverPerIntent.isFetching ||
                snoozedPerIntent.isFetching ||
                totalPerIntent.isFetching,
            costSaved:
                handoverPerIntent.isFetching ||
                snoozedPerIntent.isFetching ||
                totalPerIntent.isFetching,
        }),
        [
            handoverPerIntent.isFetching,
            snoozedPerIntent.isFetching,
            totalPerIntent.isFetching,
        ],
    )

    const isError =
        handoverPerIntent.isError ||
        snoozedPerIntent.isError ||
        totalPerIntent.isError

    return {
        data,
        isLoading,
        isError,
        loadingStates,
    }
}
