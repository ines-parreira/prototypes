import { NavbarPanel } from 'core/navigation'
import { DefaultExportTicketNavbar as TicketNavbar } from 'pages/tickets/navbar/TicketNavbar'

export function TicketsNavbarPanel() {
    return (
        <NavbarPanel>
            <TicketNavbar disableResize />
        </NavbarPanel>
    )
}
