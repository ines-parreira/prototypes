import { useMemo } from 'react'

import {
    useLegacyDispatchAuditLogEvents,
    useLegacyDispatchHideAuditLogEvents,
} from './useLegacyDispatchAuditLogEvents'
import { useLegacyDispatchDismissNotification } from './useLegacyDispatchDismissNotification'
import { useLegacyDispatchNotification } from './useLegacyDispatchNotification'
import { useLegacyTicketViewNavigation } from './useLegacyTicketViewNavigation'
import { useLegacyToggleQuickReplies } from './useLegacyToggleQuickReplies'

export const useTicketLegacyBridgeFunctions = () => {
    const dispatchNotification = useLegacyDispatchNotification()
    const dispatchDismissNotification = useLegacyDispatchDismissNotification()
    const dispatchAuditLogEvents = useLegacyDispatchAuditLogEvents()
    const dispatchHideAuditLogEvents = useLegacyDispatchHideAuditLogEvents()
    const toggleQuickReplies = useLegacyToggleQuickReplies()

    const ticketViewNavigation = useLegacyTicketViewNavigation()

    return useMemo(
        () => ({
            dispatchNotification,
            dispatchDismissNotification,
            ticketViewNavigation,
            dispatchAuditLogEvents,
            dispatchHideAuditLogEvents,
            toggleQuickReplies,
        }),
        [
            dispatchNotification,
            dispatchDismissNotification,
            ticketViewNavigation,
            dispatchAuditLogEvents,
            dispatchHideAuditLogEvents,
            toggleQuickReplies,
        ],
    )
}
