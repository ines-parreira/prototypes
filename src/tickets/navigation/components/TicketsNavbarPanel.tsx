import { NavbarPanel } from 'core/navigation'
import { TicketNavBarRevampWrapper } from 'pages/tickets/navbar/v2/TicketNavBarRevampWrapper'

export default function TicketsNavbarPanel() {
    return (
        <NavbarPanel>
            <TicketNavBarRevampWrapper disableResize />
        </NavbarPanel>
    )
}
