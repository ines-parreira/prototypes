import React from 'react'
import TicketView from './TicketView'

export default class Dashboard extends React.Component {
    render() {
        return (
            <div className="ui container">
                <TicketView slug="my-tickets" title="My Tickets" />
            </div>
        )
    }
}
