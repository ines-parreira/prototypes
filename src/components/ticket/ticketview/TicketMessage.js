import React, { PropTypes } from 'react'
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

    renderAttachmentIcon(contentType) {
        if (contentType === 'application/pdf') {
            return <i className="icon file pdf outline"/>
        } else if (contentType.startsWith('image/')) {
            return <i className="icon file image outline"/>
        } else if (contentType === 'application/msword') {
            return <i className="icon file word outline"/>
        } else if (contentType.startsWith('text/')) {
            return <i className="icon file text outline"/>
        }

        return <i className="icon attach"/>
    }

    renderAttachment(message) {
        if (message.attachments) {
            return (
                <div className="attachments">
                    {
                        message.attachments.map(attachment => (
                            <div className="ui label">
                                {this.renderAttachmentIcon(attachment.content_type)}
                                <a key={attachment.name} href={attachment.url} target="_blank">{attachment.name}</a>
                            </div>
                        ))
                    }
                </div>
            )
        }
    }

    renderSource(message) {
        if (!message.public) {
            return null
        }

        return (
            <span className="ticket-message-source">
                <div className="ui dropdown" id="email-dropdown">
                    <span className="text">
                        <i className="icon mail"/>
                        &lt;{message.sender.email}&gt;
                    </span>
                    <div className="ticket-message-source-details menu transition">
                        <ul className="item">
                            <li>
                                To:
                                <strong>
                                    {message.receiver.email}
                                </strong>
                            </li>
                            <li>
                                From:
                                <strong>
                                    {message.sender.email}
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
        )
    }

    render() {
        const { message, currentUser } = this.props

        let createdDatetime = ''
        if (message.created_datetime) {
            createdDatetime = moment(message.created_datetime).tz(currentUser.get('timezone') || 'UTC').calendar()
        }

        let className = 'ticket-message'

        if (!message.public) {
            className = 'ticket-message internal'
        }

        return (
            <div className={className} ref="ticketMessage">
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

                        {this.renderSource(message)}
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

                {/*
                <div className="ticket-actions-btn ui dropdown" id="option-dropdown">
                    <i className="ui icon angle down"/>
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
                */}

                {this.renderAttachment(message)}

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
        attachments: PropTypes.array
    }).isRequired,
    currentUser: PropTypes.object.isRequired
}
