import React, {PropTypes} from 'react'
import moment from 'moment'

export default class TicketTable extends React.Component {
    stripHTML(text) {
        try {
            const doc = document.implementation.createHTMLDocument()
            const body = doc.createElement('div')
            body.innerHTML = text

            const removeElements = body.querySelectorAll('style,script')
            for (let i = 0; i < removeElements.length; i++) {
                removeElements[i].remove()
            }
            return body.textContent || body.innerText
        } catch (e) {
            console.error('Failed stripHTML: ' + e, text)
            return text
        }
    }

    trim(text, length) {
        text = this.stripHTML(text)
        const slice = text.slice(0, length)
        return slice !== text ? slice + ' ...' : text
    }

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
                        <tr className="ticket-item" key={ticket.id}
                            onClick={() => {this.props.pushState(`/ticket/${ticket.id}`)}}>
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
                                        className="subject">{this.trim(ticket.subject, 50)}</span>
                                    <div className="body sub header">
                                        {this.trim(ticket.body_html ? ticket.body_html : ticket.body_text, 100)}
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
    tickets: PropTypes.array.isRequired,
    pushState: PropTypes.func.isRequired
}
