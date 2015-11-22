import React from 'react'

export default class TicketTable extends React.Component {
    render() {
        return (
            <table className="ui very basic selectable table">
                <tbody>
                {this.props.tickets.map((ticket) => { return (
                    <tr key={ticket.id}>
                        <td>{ticket.subject}</td>
                        <td>{ticket.body}</td>
                        <td>{ticket.channel}</td>
                    </tr>
                )})}
                </tbody>
            </table>
        )
    }
}
