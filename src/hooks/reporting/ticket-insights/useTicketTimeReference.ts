import { useCallback } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useLocalStorage from 'hooks/useLocalStorage'
import { TicketTimeReference } from 'models/stat/types'

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

const LEGACY_TICKET_TIME_REFERENCE = TicketTimeReference.TaggedAt
const DEFAULT_TICKET_TIME_REFERENCE = TicketTimeReference.CreatedAt

const getEffectiveTicketTimeReference = (
    value: TicketTimeReference,
    isSupported = false,
) => {
    if (!isSupported) return LEGACY_TICKET_TIME_REFERENCE

    return isValidTicketTimeReference(value)
        ? value
        : DEFAULT_TICKET_TIME_REFERENCE
}

export const useTicketTimeReference = (entity: Entity) => {
    const isReportingExtendFieldAndTagEnabled = useFlag(
        FeatureFlagKey.ReportingExtendFieldAndTag,
    )

    const [selectedTicketTimeReference, setSelectedTicketTimeReference] =
        useLocalStorage(getStorageKey(entity), DEFAULT_TICKET_TIME_REFERENCE)

    const value = getEffectiveTicketTimeReference(
        selectedTicketTimeReference,
        isReportingExtendFieldAndTagEnabled,
    )

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
