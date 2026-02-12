import { useCallback } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'

import { TicketTimeReference } from 'domains/reporting/models/stat/types'

export enum Entity {
    Tag = 'tags',
    TicketField = 'ticket-fields',
}

export const getStorageKey = (entity: Entity) => {
    return [entity, 'time-reference'].join('/')
}

const isValidTicketTimeReference = (
    value: unknown,
): value is TicketTimeReference => {
    return Object.values(TicketTimeReference).includes(
        value as TicketTimeReference,
    )
}

const DEFAULT_TICKET_TIME_REFERENCE = TicketTimeReference.CreatedAt

export const useTicketTimeReference = (
    entity: Entity,
): [TicketTimeReference, (value: TicketTimeReference) => void] => {
    const [selectedTicketTimeReference, setSelectedTicketTimeReference] =
        useLocalStorage(getStorageKey(entity), DEFAULT_TICKET_TIME_REFERENCE)

    const value = isValidTicketTimeReference(selectedTicketTimeReference)
        ? selectedTicketTimeReference
        : DEFAULT_TICKET_TIME_REFERENCE

    const handleTicketTimeReferenceChange = useCallback(
        (value: TicketTimeReference) => {
            setSelectedTicketTimeReference(value)

            logEvent(SegmentEvent.StatTimeframePreferenceSelection, {
                value,
                report: entity,
            })
        },
        [setSelectedTicketTimeReference, entity],
    )

    return [value, handleTicketTimeReferenceChange] as const
}
