import React, {PropTypes} from 'react'
import {List} from 'immutable'
import {formatDatetime} from '../../../utils'
import { SOURCE_VALUE_PROP } from '../../../constants'
import classNames from 'classnames'
import TicketMessageActions from './TicketMessageActions'
import TicketMessageBody from './TicketMessageBody'
import TicketAttachments from './replyarea/TicketAttachments'

export default class TicketMessage extends React.Component {
    componentDidMount() {
        $('#email-dropdown', this.refs.ticketMessage).dropdown({
            on: 'hover',
            action: 'nothing'
        })
        // $('#option-dropdown', this.refs.ticketMessage).dropdown({
        //     on: 'hover',
        //     action: 'nothing'
        // })
        $('.actions .label').popup({inline: true})
    }

    renderAttachment(message) {
        if (message.attachments) {
            return (
                <TicketAttachments attachments={List(message.attachments)} removable={false}/>
            )
        }
        return null
    }

    renderSource(message) {
        if (!message.public) {
            return null
        }

        const icons = {
            email: 'mail',
            'facebook-message': 'facebook-messenger',
            'facebook-comment': 'facebook square'
        }

        const legend = !message.source.type.startsWith('facebook') ?
            `<${message.source.from[SOURCE_VALUE_PROP[message.source.type]]}>` : ''

        return (
            <span className="ticket-message-source">
                <div className="ui dropdown" id="email-dropdown">
                    <span className="text">
                        <i className={`icon ${icons[message.source.type]}`}/>
                        {legend}
                    </span>
                    <div className="ticket-message-source-details menu transition">
                        <ul className="item">
                            <li>
                                To:
                                <strong>
                                    {message.source.to.map(dest => `${dest.name} <${dest[SOURCE_VALUE_PROP[message.source.type]]}>`).join(', ')}
                                </strong>
                            </li>
                            <li>
                                From:
                                <strong>
                                    {`${message.source.from.name} <${message.source.from[SOURCE_VALUE_PROP[message.source.type]]}>`}
                                </strong>
                            </li>
                            <li>
                                Send via:
                                <strong>
                                    {message.source.type}
                                </strong>
                            </li>
                        </ul>
                    </div>
                </div>
            </span>
        )
    }

    render() {
        const {message, currentUser} = this.props

        // const messages = ticket.get('messages')
        // const currentMessageIndex = messages.findIndex((o) => o.get('id') === message.id)
        // const previousMessage = currentMessageIndex > 0 ? messages.get(currentMessageIndex - 1) : null

        let createdDatetime = ''
        if (message.created_datetime) {
            createdDatetime = formatDatetime(message.created_datetime, currentUser.get('timezone'))
        }

        let error = false
        let pending = false

        for (const action in message.actions) {
            if (message.actions[action].status === 'error') {
                error = true
                break
            } else if (message.actions[action].status === 'pending') {
                pending = true
            }
        }

        const className = classNames(
            'ticket-message',
            'ui',
            'raw',
            'segment',
            {
                internal: !message.public,
                loading: pending && !error
            }
        )

        return (
            <div className={className} ref="ticketMessage">
                <div className={`ui inverted dimmer ${error ? 'active' : ''}`} data-opacity="0">
                    <div className="content">
                        <div className="center" style={{ color: 'red' }}>
                            <div className={`ui segment ${this.props.loading ? 'loading' : ''}`}
                                 style={{ margin: 'auto', width: '50%'}}
                            >
                                This message wasn't send: one or more actions failed.
                                <div style={{ margin: '1em auto'}}>
                                    <TicketMessageActions message={message}/>
                                </div>
                                <a onClick={() => this.props.submit(null, null, 'retry', false)}>retry</a> to execute the
                                failed action(s) automatically, and send the message if it succeeds,<br/>
                                <a onClick={() => this.props.submit(null, null, 'force', false)}>ignore failure</a>, execute
                                the other actions and send the message<br/>
                                <a onClick={() => this.props.deleteMessage(message.id)}>cancel</a> the message, and
                                manually undo successful action(s).
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ticket-message-header">
                    <div className="ticket-message-header-details">
                        {(() => {
                            if (message.from_agent) {
                                return (<span className="agent-label ui medium yellow label">A</span>)
                            }
                            return null
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
                <TicketMessageBody message={message} />
                {this.renderAttachment(message)}
                <TicketMessageActions message={message}/>
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
        attachments: PropTypes.array,
        actions: PropTypes.array
    }).isRequired,
    loading: PropTypes.bool.isRequired,
    currentUser: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    deleteMessage: PropTypes.func.isRequired,
    ticket: PropTypes.object
}
