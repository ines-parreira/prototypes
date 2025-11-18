import { useMemo } from 'react'

import {
    useLegacyDispatchAuditLogEvents,
    useLegacyDispatchHideAuditLogEvents,
} from './useLegacyDispatchAuditLogEvents'
import { useLegacyDispatchNotification } from './useLegacyDispatchNotification'
import { useLegacyTicketViewNavigation } from './useLegacyTicketViewNavigation'
import { useLegacyToggleQuickReplies } from './useLegacyToggleQuickReplies'

export const useTicketLegacyBridgeFunctions = () => {
    const dispatchNotification = useLegacyDispatchNotification()
    const dispatchAuditLogEvents = useLegacyDispatchAuditLogEvents()
    const dispatchHideAuditLogEvents = useLegacyDispatchHideAuditLogEvents()
    const toggleQuickReplies = useLegacyToggleQuickReplies()

    const ticketViewNavigation = useLegacyTicketViewNavigation()

    return useMemo(
        () => ({
            dispatchNotification,
            ticketViewNavigation,
            dispatchAuditLogEvents,
            dispatchHideAuditLogEvents,
            toggleQuickReplies,
        }),
        [
            dispatchNotification,
            ticketViewNavigation,
            dispatchAuditLogEvents,
            dispatchHideAuditLogEvents,
            toggleQuickReplies,
        ],
    )
}
