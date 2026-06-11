import { TicketsLegacyBridgeProvider } from '@repo/tickets'

import { DefaultExportTicketNavbar as TicketNavbar } from 'pages/tickets/navbar/TicketNavbar'
import { useTicketLegacyBridgeFunctions } from 'tickets/core/hooks/legacyBridge/useTicketLegacyBridgeFunctions'

export function InboxSidebar() {
    const ticketLegacyBridgeFunctions = useTicketLegacyBridgeFunctions()

    return (
        <TicketsLegacyBridgeProvider {...ticketLegacyBridgeFunctions}>
            <TicketNavbar />
        </TicketsLegacyBridgeProvider>
    )
}
