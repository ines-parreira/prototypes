import { NavbarPanel } from 'core/navigation'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import { useSplitTicketViewSwitcher } from 'split-ticket-view-toggle'

export default function TicketsNavbarPanel() {
    useSplitTicketViewSwitcher()

    return (
        <NavbarPanel>
            <TicketNavbar disableResize />
        </NavbarPanel>
    )
}
