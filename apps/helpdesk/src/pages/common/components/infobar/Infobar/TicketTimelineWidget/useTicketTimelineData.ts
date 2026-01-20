import { useMemo } from 'react'

import type { EnrichedTicket, TicketCustomField } from '@repo/tickets'

import type { IconName } from '@gorgias/axiom'
import type { CustomField, TicketCompact } from '@gorgias/helpdesk-queries'

import { AI_MANAGED_TYPES, OBJECT_TYPES } from 'custom-fields/constants'
import { evaluateCustomFieldsConditions } from 'custom-fields/helpers/evaluateCustomFieldsConditions'
import { getShortValueLabel } from 'custom-fields/helpers/getValueLabels'
import { isFieldRequired } from 'custom-fields/helpers/isFieldRequired'
import { isFieldVisible } from 'custom-fields/helpers/isFieldVisible'
import { useCustomFieldConditions } from 'custom-fields/hooks/queries/useCustomFieldConditions'
import type {
    CustomFieldAIManagedType,
    CustomFieldValue,
} from 'custom-fields/types'

type ChannelToIconFn = (channel?: string) => IconName

type UseTicketTimelineDataParams = {
    tickets: TicketCompact[]
    customFieldDefinitions: CustomField[]
    activeTicketId?: string
    channelToIcon: ChannelToIconFn
}

type UseTicketTimelineDataResult = {
    displayedTickets: EnrichedTicket[]
    totalNumber: number
    openTicketsNumber: number
    snoozedTicketsNumber: number
}

const MAX_TICKETS_TO_DISPLAY = 3

export function useTicketTimelineData({
    tickets,
    customFieldDefinitions,
    activeTicketId,
    channelToIcon,
}: UseTicketTimelineDataParams): UseTicketTimelineDataResult {
    const { customFieldConditions, isLoading: conditionsLoading } =
        useCustomFieldConditions({
            objectType: OBJECT_TYPES.TICKET,
            includeDeactivated: false,
            enabled: true,
        })

    // Calculate ticket counts
    const totalNumber = tickets.length
    const openTicketsNumber = useMemo(
        () => tickets.filter((ticket) => ticket.status !== 'closed').length,
        [tickets],
    )
    const snoozedTicketsNumber = useMemo(
        () =>
            tickets.filter(
                (ticket) =>
                    ticket.status === 'closed' && ticket.snooze_datetime,
            ).length,
        [tickets],
    )

    // Filter and prioritize raw tickets for display
    const ticketsToDisplay = useMemo(() => {
        if (tickets.length <= 1) {
            return tickets
        }

        const otherTickets = tickets.filter(
            (ticket) => ticket.id.toString() !== activeTicketId,
        )

        const openTickets = otherTickets.filter(
            (ticket) => ticket.status !== 'closed' && !ticket.snooze_datetime,
        )
        const snoozedTickets = otherTickets.filter((ticket) =>
            Boolean(ticket.snooze_datetime),
        )
        const closedTickets = otherTickets.filter(
            (ticket) => ticket.status === 'closed' && !ticket.snooze_datetime,
        )

        const hasOpenOrSnoozed =
            openTickets.length > 0 || snoozedTickets.length > 0

        if (!hasOpenOrSnoozed) {
            return closedTickets.slice(0, 1)
        }

        const prioritizedTickets = [...openTickets, ...snoozedTickets]
        return prioritizedTickets.slice(0, MAX_TICKETS_TO_DISPLAY)
    }, [tickets, activeTicketId])

    // Filter out AI-managed fields (same logic as TicketFields.tsx)
    const filteredDefinitions = useMemo(
        () =>
            customFieldDefinitions.filter(
                (definition) =>
                    !definition.managed_type ||
                    !Object.values(AI_MANAGED_TYPES).includes(
                        definition.managed_type as CustomFieldAIManagedType,
                    ),
            ),
        [customFieldDefinitions],
    )

    // Enrich only the displayed tickets with evaluation results and custom fields
    const displayedTickets = useMemo(() => {
        return ticketsToDisplay.map((ticket) => {
            const evaluationResults = evaluateCustomFieldsConditions(
                customFieldConditions,
                OBJECT_TYPES.TICKET,
                ticket,
            )

            // Determine visible field IDs (same logic as TicketFields.tsx)
            const visibleFieldIds = new Set<number>()
            filteredDefinitions.forEach((fieldDefinition) => {
                const isRequired = isFieldRequired(
                    fieldDefinition,
                    evaluationResults[fieldDefinition.id],
                )
                const isVisible =
                    isRequired ||
                    isFieldVisible(
                        fieldDefinition,
                        evaluationResults[fieldDefinition.id],
                    )

                if (isVisible) {
                    visibleFieldIds.add(fieldDefinition.id)
                }
            })

            // Get field values and filter to visible ones
            const fieldValues =
                ticket.custom_fields === null ? {} : ticket.custom_fields || {}
            const customFields: TicketCustomField[] = Object.keys(fieldValues)
                .map(Number)
                .filter((fieldId) => visibleFieldIds.has(fieldId))
                .map((fieldId) => {
                    const definition = customFieldDefinitions.find(
                        (d) => d.id === fieldId,
                    )
                    const value = fieldValues[fieldId]?.value as
                        | CustomFieldValue
                        | undefined
                    return {
                        id: fieldId,
                        label: definition?.label || `Custom Field ${fieldId}`,
                        value,
                        shortValueLabel: getShortValueLabel(value),
                    }
                })

            return {
                ticket,
                evaluationResults,
                conditionsLoading,
                isFieldRequired,
                isFieldVisible,
                customFields,
                iconName: channelToIcon(ticket.channel),
            }
        })
    }, [
        ticketsToDisplay,
        customFieldConditions,
        conditionsLoading,
        filteredDefinitions,
        customFieldDefinitions,
        channelToIcon,
    ])

    return {
        displayedTickets,
        totalNumber,
        openTicketsNumber,
        snoozedTicketsNumber,
    }
}
