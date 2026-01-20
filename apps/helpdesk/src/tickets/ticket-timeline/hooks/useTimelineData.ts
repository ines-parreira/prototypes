import { useMemo, useState } from 'react'

import type { EnrichedTicket, TicketCustomField } from '@repo/tickets'

import type { IconName } from '@gorgias/axiom'
import type { CustomField, TicketCompact } from '@gorgias/helpdesk-queries'

import type { Order } from 'constants/integrations/types/shopify'
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
import * as timelineItem from 'timeline/helpers/timelineItem'
import type {
    FilterKey,
    InteractionFilterType,
    Range,
    TimelineItem,
} from 'timeline/types'

export type ChannelToIconFn = (channel?: string) => IconName

export type StatusFilter = 'open' | 'closed' | 'snoozed'
export type SortOption =
    | 'updated-desc'
    | 'updated-asc'
    | 'created-desc'
    | 'created-asc'

type UseTimelineDataParams = {
    tickets: TicketCompact[]
    orders: Order[]
    customFieldDefinitions: CustomField[]
    channelToIcon: ChannelToIconFn
}

type UseTimelineDataResult = {
    timelineItems: TimelineItem[]
    enrichedTickets: EnrichedTicket[]
    totalNumber: number
    openTicketsNumber: number
    snoozedTicketsNumber: number
    closedTicketsNumber: number
    statusFilters: Set<StatusFilter>
    toggleStatusFilter: (status: StatusFilter) => void
    sortOption: SortOption
    setSortOption: (option: SortOption) => void
    isLoading: boolean
    rangeFilter: Range
    setRangeFilter: (range: Range) => void
    interactionTypeFilters: Record<InteractionFilterType, boolean>
    setInteractionTypeFilters: React.Dispatch<
        React.SetStateAction<Record<InteractionFilterType, boolean>>
    >
    selectedStatusKeys: FilterKey[]
    selectedTypeKeys: InteractionFilterType[]
    toggleSelectedStatus: (status: FilterKey) => void
}

export function useTimelineData({
    tickets,
    orders,
    customFieldDefinitions,
    channelToIcon,
}: UseTimelineDataParams): UseTimelineDataResult {
    // Interaction type filter state - default to showing only tickets
    const [interactionTypeFilters, setInteractionTypeFilters] = useState<
        Record<InteractionFilterType, boolean>
    >({ ticket: true, order: false })

    // Status filter state - all statuses selected by default
    const [statusFilters, setStatusFilters] = useState<Set<StatusFilter>>(
        new Set(['open', 'snoozed', 'closed']),
    )

    // Range filter state
    const [rangeFilter, setRangeFilter] = useState<Range>({
        start: null,
        end: null,
    })

    // Sort state
    const [sortOption, setSortOption] = useState<SortOption>('updated-desc')

    const { customFieldConditions, isLoading: conditionsLoading } =
        useCustomFieldConditions({
            objectType: OBJECT_TYPES.TICKET,
            includeDeactivated: false,
            enabled: true,
        })

    // Include all tickets (including the active ticket)
    const allTickets = tickets

    // Calculate ticket counts
    const totalNumber = allTickets.length
    const openTicketsNumber = useMemo(
        () =>
            allTickets.filter(
                (ticket) =>
                    ticket.status !== 'closed' && !ticket.snooze_datetime,
            ).length,
        [allTickets],
    )
    const snoozedTicketsNumber = useMemo(
        () =>
            allTickets.filter((ticket) => Boolean(ticket.snooze_datetime))
                .length,
        [allTickets],
    )
    const closedTicketsNumber = useMemo(
        () =>
            allTickets.filter(
                (ticket) =>
                    ticket.status === 'closed' && !ticket.snooze_datetime,
            ).length,
        [allTickets],
    )

    // Toggle status filter
    const toggleStatusFilter = (status: StatusFilter) => {
        setStatusFilters((prev) => {
            const newFilters = new Set(prev)
            if (newFilters.has(status)) {
                newFilters.delete(status)
            } else {
                newFilters.add(status)
            }
            return newFilters
        })
    }

    // Convert statusFilters Set to FilterKey array for compatibility
    const selectedStatusKeys: FilterKey[] = Array.from(statusFilters).map(
        (status) => {
            if (status === 'snoozed') return 'snooze'
            return status as FilterKey
        },
    )

    // Get selected interaction type keys
    const selectedTypeKeys: InteractionFilterType[] = Object.keys(
        interactionTypeFilters,
    ).filter(
        (key) => interactionTypeFilters[key as InteractionFilterType],
    ) as InteractionFilterType[]

    // Toggle status filter (for main timeline compatibility)
    const toggleSelectedStatus = (status: FilterKey) => {
        const mappedStatus: StatusFilter =
            status === 'snooze' ? 'snoozed' : (status as StatusFilter)
        toggleStatusFilter(mappedStatus)
    }

    // Apply range filter
    const rangeFilteredTickets = useMemo(() => {
        if (!rangeFilter.start && !rangeFilter.end) {
            return allTickets
        }

        return allTickets.filter((ticket) => {
            const ticketDate = new Date(ticket.created_datetime).getTime()
            return (
                ticketDate >= (rangeFilter.start || 0) &&
                ticketDate <= (rangeFilter.end || Date.now())
            )
        })
    }, [allTickets, rangeFilter])

    // Apply range filter to orders
    const rangeFilteredOrders = useMemo(() => {
        if (!rangeFilter.start && !rangeFilter.end) {
            return orders
        }

        return orders.filter((order) => {
            const orderDate = new Date(order.created_at).getTime()
            return (
                orderDate >= (rangeFilter.start || 0) &&
                orderDate <= (rangeFilter.end || Date.now())
            )
        })
    }, [orders, rangeFilter])

    // Apply interaction type filter
    // When no types are selected, show everything (don't apply filter)
    const typeFilteredTickets = useMemo(() => {
        if (
            selectedTypeKeys.length === 0 ||
            selectedTypeKeys.includes('ticket')
        ) {
            return rangeFilteredTickets
        }
        return []
    }, [rangeFilteredTickets, selectedTypeKeys])

    const typeFilteredOrders = useMemo(() => {
        if (
            selectedTypeKeys.length === 0 ||
            selectedTypeKeys.includes('order')
        ) {
            return rangeFilteredOrders
        }
        return []
    }, [rangeFilteredOrders, selectedTypeKeys])

    // Apply status filters
    const filteredTickets = useMemo(() => {
        if (statusFilters.size === 0) {
            return typeFilteredTickets
        }

        return typeFilteredTickets.filter((ticket) => {
            const isSnoozed = Boolean(ticket.snooze_datetime)
            const isClosed = ticket.status === 'closed' && !isSnoozed
            const isOpen = ticket.status !== 'closed' && !isSnoozed

            if (statusFilters.has('snoozed') && isSnoozed) return true
            if (statusFilters.has('closed') && isClosed) return true
            if (statusFilters.has('open') && isOpen) return true

            return false
        })
    }, [typeFilteredTickets, statusFilters])

    // Apply sorting
    const sortedTickets = useMemo(() => {
        const sorted = [...filteredTickets]

        switch (sortOption) {
            case 'updated-desc':
                sorted.sort(
                    (a, b) =>
                        new Date(b.last_message_datetime ?? 0).getTime() -
                        new Date(a.last_message_datetime ?? 0).getTime(),
                )
                break
            case 'updated-asc':
                sorted.sort(
                    (a, b) =>
                        new Date(a.last_message_datetime ?? 0).getTime() -
                        new Date(b.last_message_datetime ?? 0).getTime(),
                )
                break
            case 'created-desc':
                sorted.sort(
                    (a, b) =>
                        new Date(b.created_datetime).getTime() -
                        new Date(a.created_datetime).getTime(),
                )
                break
            case 'created-asc':
                sorted.sort(
                    (a, b) =>
                        new Date(a.created_datetime).getTime() -
                        new Date(b.created_datetime).getTime(),
                )
                break
        }

        return sorted
    }, [filteredTickets, sortOption])

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

    // Enrich tickets with evaluation results and custom fields
    const enrichedTickets = useMemo(() => {
        return sortedTickets.map((ticket) => {
            const evaluationResults = evaluateCustomFieldsConditions(
                customFieldConditions,
                OBJECT_TYPES.TICKET,
                ticket,
            )

            // Determine visible field IDs
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
        sortedTickets,
        customFieldConditions,
        conditionsLoading,
        filteredDefinitions,
        customFieldDefinitions,
        channelToIcon,
    ])

    // Combine enriched tickets and filtered orders into timeline items
    const timelineItems = useMemo(() => {
        const ticketItems = enrichedTickets.map((enriched) =>
            timelineItem.fromTicket(enriched.ticket),
        )
        const orderItems = typeFilteredOrders.map((order) =>
            timelineItem.fromOrder(order),
        )
        const combined = [...ticketItems, ...orderItems]

        // Apply sorting to combined timeline items
        combined.sort((a, b) => {
            let dateA: number
            let dateB: number

            switch (sortOption) {
                case 'updated-desc':
                case 'updated-asc': {
                    // For tickets, use last_message_datetime; for orders, use updated_at
                    dateA =
                        a.kind === 'ticket'
                            ? new Date(
                                  a.ticket.last_message_datetime ?? 0,
                              ).getTime()
                            : new Date(a.order.updated_at).getTime()
                    dateB =
                        b.kind === 'ticket'
                            ? new Date(
                                  b.ticket.last_message_datetime ?? 0,
                              ).getTime()
                            : new Date(b.order.updated_at).getTime()
                    break
                }
                case 'created-desc':
                case 'created-asc': {
                    // For tickets, use created_datetime; for orders, use created_at
                    dateA =
                        a.kind === 'ticket'
                            ? new Date(a.ticket.created_datetime).getTime()
                            : new Date(a.order.created_at).getTime()
                    dateB =
                        b.kind === 'ticket'
                            ? new Date(b.ticket.created_datetime).getTime()
                            : new Date(b.order.created_at).getTime()
                    break
                }
            }

            // Apply ascending or descending order
            return sortOption.endsWith('desc') ? dateB - dateA : dateA - dateB
        })

        return combined
    }, [enrichedTickets, typeFilteredOrders, sortOption])

    return {
        timelineItems,
        enrichedTickets,
        totalNumber,
        openTicketsNumber,
        snoozedTicketsNumber,
        closedTicketsNumber,
        statusFilters,
        toggleStatusFilter,
        sortOption,
        setSortOption,
        isLoading: conditionsLoading,
        rangeFilter,
        setRangeFilter,
        interactionTypeFilters,
        setInteractionTypeFilters,
        selectedStatusKeys,
        selectedTypeKeys,
        toggleSelectedStatus,
    }
}
