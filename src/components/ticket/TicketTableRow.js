import React, {PropTypes} from 'react'
import moment from 'moment'
import 'moment-timezone'
import { immutableRenderDecorator } from 'react-immutable-render-mixin'


@immutableRenderDecorator
export default class TicketTableRow extends React.Component {
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
        const {currentUser, ticket, pushState} = this.props
        let createdDatetime = ''
        if (ticket.created_datetime) {
            createdDatetime = moment(ticket.created_datetime).tz(currentUser.get('timezone', 'UTC')).fromNow()
        }

        // Unfortunately need to render a new .ui.grid for every row since
        // semantic needs .rows to be a direct child of them, which react-infinite
        // doesn't allow
        return (            
            <div className="ui grid" key={this.props.key}>
                <div className="ticket-item row" key={ticket.id}
                    onClick={() => {this.props.pushState(`/ticket/${ticket.id}`)}}>
                    <div className="one wide column collapsing">
                        <span className="ui checkbox">
                            <input type="checkbox"/>
                            <label></label>
                        </span>
                        <i className={`ticket-priority ${ticket.priority} flag ${ticket.priority === 'high' ? '' : 'outline'} icon`}></i>
                    </div>
                    <div className="ten wide column details">
                        <div className="ui header">
                            <span
                                className="subject">{this.trim(ticket.subject, 50)}</span>
                            <div className="body sub header">
                                {this.trim(ticket.body_html ? ticket.body_html : ticket.body_text, 100)}
                            </div>
                        </div>
                    </div>
                    <div className="three wide column">
                        {createdDatetime}
                    </div>
                    <div className="two wide column">
                        {ticket.channel}
                    </div>
                </div>
            </div>
        )
    }
}

TicketTableRow.propTypes = {
    ticket: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired,
}
