import React, {PropTypes} from 'react'
import linkifyStr from 'linkifyjs/string'
import moment from 'moment'
import 'moment-timezone'

export default class TicketMessage extends React.Component {
    componentDidMount() {
        $('#email-dropdown', this.refs.ticketMessage).dropdown({
            on: 'hover',
            action: 'nothing'
        })
        $('#option-dropdown', this.refs.ticketMessage).dropdown({
            on: 'hover',
            action: 'nothing'
        })
    }

    render() {
        const { message, currentUser } = this.props

        let createdDatetime = ''
        if (message.created_datetime) {
            createdDatetime = moment(message.created_datetime).tz(currentUser.get('timezone') || 'UTC').fromNow()
        }
        return (
            <div className="ticket-message" ref="ticketMessage">
                <div className="ticket-message-header">
                    <div className="ticket-message-header-details">
                        {(() => {
                            if (message.from_agent) {
                                return (<span className="agent-label ui medium yellow label">A</span>)
                            }
                        })()}

                        <span className="ticket-message-author ui medium header">
                            {message.sender.name}
                        </span>

                        <span className="ticket-message-source">
                            <div className="ui dropdown" id="email-dropdown">
                                <span className="text">
                                    <i className="icon mail"></i>
                                    &lt;{message.sender.email}&gt;
                                </span>
                                <div className="ticket-message-source-details menu transition">
                                    <ul className="item">
                                        <li>
                                            To:
                                            <strong>
                                                {message.sender.email}
                                            </strong>
                                        </li>
                                        <li>
                                            From:
                                            <strong>
                                                support@gorgias.io
                                            </strong>
                                        </li>
                                        <li>
                                            Send via:
                                            <strong>
                                                Email
                                            </strong>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </span>
                    </div>
                    <div className="ticket-message-time">
                        {createdDatetime}
                    </div>
                </div>
                {(() => {
                    if (message.body_html) {
                        return (
                            <div className="ticket-message-body"
                                    dangerouslySetInnerHTML={{__html: message.body_html}}></div>
                        )
                    }
                    return (
                        <div className="ticket-message-body ticket-message-body-text" dangerouslySetInnerHTML={{__html: linkifyStr(message.body_text)}}>
                        </div>
                    )
                })()}

                <div className="ticket-actions-btn ui dropdown" id="option-dropdown">
                    <i className="ui icon angle down"></i>
                    <div className="menu transition">
                        <div className="item">
                            <a href="#">
                                Most Recent Orders
                            </a>
                        </div>
                        <div className="item">
                            <a href="#">
                                View Original
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

TicketMessage.propTypes = {
    message: PropTypes.shape({
        sender: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
            email: PropTypes.string
        }),
        from_agent: PropTypes.bool.isRequired,
        body_text: PropTypes.string.isRequired,
        body_html: PropTypes.string.isRequired,
        created_datetime: PropTypes.string.isRequired,
    }).isRequired,
    currentUser: PropTypes.object.isRequired
}
