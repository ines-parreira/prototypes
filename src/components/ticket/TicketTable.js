import React, {PropTypes} from 'react'
import moment from 'moment'

export default class TicketTable extends React.Component {
    render() {
        return (
            <table className="ui single line very basic selectable table">
                <thead>
                <tr>
                    <th className="one wide">
                        <span className="ui checkbox">
                            <input type="checkbox"/>
                            <label></label>
                        </span>
                    </th>
                    <th className="ten wide">Ticket Details</th>
                    <th className="three wide">Created <i className="sort icon"></i></th>
                    <th className="two wide">Channel <i className="sort icon"></i></th>
                </tr>
                </thead>
                <tbody>
                {this.props.tickets.map((ticket) => {
                    return (
                        <tr className="ticket-item" key={ticket.id}>
                            <td className="collapsing">
                                <span className="ui checkbox">
                                    <input type="checkbox"/>
                                    <label></label>
                                </span>
                                <i className={`ticket-priority ${ticket.priority} flag ${ticket.priority === 'high' ? '' : 'outline'} icon`}></i>
                            </td>
                            <td className="details">
                                <div className="ui header">
                                    <span
                                        className="subject">{ticket.subject.slice(0, 50)}{ticket.subject.slice(0, 50) !== ticket.subject ? '...' : ''}</span>
                                    <div className="body sub header">
                                        {ticket.body.slice(0, 100)}{ticket.body.slice(0, 100) !== ticket.body ? '...' : ''}
                                    </div>
                                </div>
                            </td>
                            <td>{ticket.created_datetime ? moment(ticket.created_datetime).fromNow() : ''}</td>
                            <td>{ticket.channel}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
    )
    }
    }

    TicketTable.propTypes = {
        tickets: PropTypes.object.isRequired
    }