import React from 'react'

import TicketListContainer from '../tickets/list/TicketListContainer'

export default class WelcomeContainer extends React.Component {
    render() {
        return <TicketListContainer view="my-tickets" title="My Tickets" />
    }
}
