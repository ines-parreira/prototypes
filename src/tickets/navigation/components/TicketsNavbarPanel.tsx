import React from 'react'

import {NavbarPanel} from 'core/navigation'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'

export default function TicketsNavbarPanel() {
    return (
        <NavbarPanel>
            <TicketNavbar disableResize />
        </NavbarPanel>
    )
}
