import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useLocalStorage from 'hooks/useLocalStorage'
import { TicketTimeReference } from 'models/stat/types'

export enum Entity {
    Tag = 'Tag',
    TicketField = 'TicketField',
}

const getStorageKey = (entity: Entity) => {
    return [entity, 'time-reference'].join(':')
}

const isValidTicketTimeReference = (
    value: unknown,
): value is TicketTimeReference => {
    return Object.values(TicketTimeReference).includes(
        value as TicketTimeReference,
    )
}

const DEFAULT_TICKET_TIME_REFERENCE = TicketTimeReference.TaggedAt

export const useTicketTimeReference = (entity: Entity) => {
    const isReportingExtendFieldAndTagEnabled = useFlag(
        FeatureFlagKey.ReportingExtendFieldAndTag,
    )

    const [selectedTicketTimeReference, setSelectedTicketTimeReference] =
        useLocalStorage(getStorageKey(entity), DEFAULT_TICKET_TIME_REFERENCE)

    const value =
        isReportingExtendFieldAndTagEnabled &&
        isValidTicketTimeReference(selectedTicketTimeReference)
            ? selectedTicketTimeReference
            : DEFAULT_TICKET_TIME_REFERENCE

    return [value, setSelectedTicketTimeReference] as const
}
