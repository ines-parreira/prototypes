import React from 'react'
import TicketsContainer from './Tickets'

export default class Dashboard extends React.Component {
    render() {
        return (
            <TicketsContainer view="my-tickets" title="My Tickets" />
        )
    }
}
