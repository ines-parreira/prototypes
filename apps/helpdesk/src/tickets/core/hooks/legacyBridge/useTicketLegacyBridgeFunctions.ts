import { useMemo } from 'react'

import { useOutboundCall } from 'hooks/integrations/phone/useOutboundCall'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useHandleTicketDraft from 'pages/common/components/CreateTicket/useHandleTicketDraft'

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
    const handleTicketDraft = useHandleTicketDraft()
    const makeOutboundCall = useOutboundCall()
    const voiceDevice = useVoiceDevice()

    const ticketViewNavigation = useLegacyTicketViewNavigation()

    return useMemo(
        () => ({
            dispatchNotification,
            dispatchDismissNotification,
            ticketViewNavigation,
            dispatchAuditLogEvents,
            dispatchHideAuditLogEvents,
            toggleQuickReplies,
            handleTicketDraft,
            makeOutboundCall,
            voiceDevice,
        }),
        [
            dispatchNotification,
            dispatchDismissNotification,
            ticketViewNavigation,
            dispatchAuditLogEvents,
            dispatchHideAuditLogEvents,
            toggleQuickReplies,
            handleTicketDraft,
            makeOutboundCall,
            voiceDevice,
        ],
    )
}
