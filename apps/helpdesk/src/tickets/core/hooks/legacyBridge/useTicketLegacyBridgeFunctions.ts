import { useMemo } from 'react'

import { useOutboundCall } from 'hooks/integrations/phone/useOutboundCall'
import { useVoiceDevice } from 'hooks/integrations/phone/useVoiceDevice'
import { useAppSelector } from 'hooks/useAppSelector'
import { useHandleTicketDraft } from 'pages/common/components/CreateTicket/useHandleTicketDraft'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { useIsToggleEnabled } from 'split-ticket-view-toggle/components/useIsToggleEnabled'
import { humanizeChannel } from 'state/ticket/utils'
import { getActiveView } from 'state/views/selectors'

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
    const activeView = useAppSelector(getActiveView)

    const ticketViewNavigation = useLegacyTicketViewNavigation()
    const ticketViewBreadcrumb = useMemo(() => {
        const viewId = activeView.get('id')
        const viewName = activeView.get('name')
        const viewSearch = activeView.get('search')

        if (
            typeof viewId !== 'number' ||
            typeof viewName !== 'string' ||
            viewName.trim().length === 0 ||
            viewSearch != null
        ) {
            return null
        }

        return {
            viewId,
            viewName,
        }
    }, [activeView])

    return useMemo(
        () => ({
            ticketViewBreadcrumb,
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
            ticketViewBreadcrumb,
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
