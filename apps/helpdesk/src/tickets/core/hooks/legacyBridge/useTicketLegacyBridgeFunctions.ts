import { useMemo } from 'react'

import { useOutboundCall } from 'hooks/integrations/phone/useOutboundCall'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useHandleTicketDraft from 'pages/common/components/CreateTicket/useHandleTicketDraft'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import useIsToggleEnabled from 'split-ticket-view-toggle/components/useIsToggleEnabled'
import { humanizeChannel } from 'state/ticket/utils'

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
    const dtpToggle = useSplitTicketView()
    const dtpEnabled = useIsToggleEnabled()

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
            dtpToggle,
            dtpEnabled,
            humanizeChannel,
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
            dtpToggle,
            dtpEnabled,
        ],
    )
}
