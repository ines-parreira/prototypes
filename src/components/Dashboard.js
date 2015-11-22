import React from 'react'
import TicketView from './ticket/TicketView'

export default class Dashboard extends React.Component {
    render() {
        return (
            <div className="ui container">
                <TicketView slug="my-tickets" />
            </div>
        )
    }
}
