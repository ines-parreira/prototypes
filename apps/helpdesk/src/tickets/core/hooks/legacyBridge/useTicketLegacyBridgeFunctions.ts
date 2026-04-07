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
import { useLegacyTicketViewNavigation } from './useLegacyTicketViewNavigation'
import { useLegacyToggleQuickReplies } from './useLegacyToggleQuickReplies'

export const useTicketLegacyBridgeFunctions = () => {
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
