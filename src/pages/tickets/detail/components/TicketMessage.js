import React, {PropTypes} from 'react'
import {List} from 'immutable'
import classNames from 'classnames'
import {isArray as _isArray} from 'lodash'
import {SOURCE_VALUE_PROP} from '../../../../config'
import TicketMessageActions from './TicketMessageActions'
import TicketMessageBody from './TicketMessageBody'
import TicketAttachments from './replyarea/TicketAttachments'
import {displayUserNameFromSource} from '../../common/utils'
import {DatetimeLabel} from '../../../common/utils/labels'

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
                <TicketAttachments attachments={List(message.attachments)} removable={false} />
            )
        }
        return null
    }

    renderSourceList(source, title, field) {
        let fieldSource = source[field]

        if (!fieldSource) {
            return null
        }

        fieldSource = _isArray(fieldSource) ? fieldSource : [fieldSource]

        if (!fieldSource.length) {
            return null
        }

        return (
            <li>{title}:
                <strong>
                    {
                        fieldSource.map((user) => {
                            return displayUserNameFromSource(user, source.type)
                        }).join(', ')
                    }
                </strong>
            </li>
        )
    }

    renderSource(message) {
        if (!message.public) {
            return null
        }

        const icons = {
            email: 'mail',
            chat: 'comments',
            api: 'code',
            'facebook-message': 'facebook-messenger',
            'facebook-comment': 'facebook square',
            'facebook-post': 'facebook square'
        }

        const source = Object.assign({}, {
            type: '',
            from: {},
            to: []
        }, message.source)

        let legend = ''
        const hasLegend = !source.type.startsWith('facebook')
            && source.type !== 'chat'
            && source.type !== 'api'

        if (hasLegend) {
            legend = `${source.from[SOURCE_VALUE_PROP[source.type]]}`
        }

        return (
            <span className="ticket-message-source">
                <div className="ui dropdown" id="email-dropdown">
                    <span className="text">
                        <i className={`icon ${icons[source.type]}`} />
                        {legend}
                    </span>
                    <div className="ticket-message-source-details menu transition">
                        <ul className="item">
                            {this.renderSourceList(source, 'From', 'from')}
                            {this.renderSourceList(source, 'To', 'to')}
                            {this.renderSourceList(source, 'Cc', 'cc')}
                            {this.renderSourceList(source, 'Bcc', 'bcc')}
                            <li>
                                Send via:
                                <strong>
                                    {source.type}
                                </strong>
                            </li>
                            <li>
                                Date:
                                <strong>{message.created_datetime}</strong>
                            </li>
                        </ul>
                    </div>
                </div>
            </span>
        )
    }

    renderMeta(message) {
        if (!message.meta || !message.meta.current_page) {
            return null
        }

        let displayString = message.meta.current_page

        if (displayString.length > 28) {
            displayString = `...${displayString.substr(displayString.length - 25)}`
        }

        return (
            <span className="ticket-message-from">
                from <a target="_blank" href={message.meta.current_page}>
                    {displayString}
                </a>
            </span>
        )
    }

    render() {
        const {message} = this.props

        // const messages = ticket.get('messages')
        // const currentMessageIndex = messages.findIndex((o) => o.get('id') === message.id)
        // const previousMessage = currentMessageIndex > 0 ? messages.get(currentMessageIndex - 1) : null

        let error = false
        let pending = false

        if (message.actions) {
            for (const action of message.actions) {
                if (action.status === 'error') {
                    error = true
                    break
                } else if (action.status === 'pending') {
                    pending = true
                }
            }
        }

        const className = classNames(
            'ticket-message',
            'ui',
            'raw',
            'segment',
            {
                'ticket-message-agent': message.from_agent
            },
            {
                internal: !message.public,
                loading: pending && !error
            }
        )

        return (
            <div className={className} ref="ticketMessage">
                <div className={`ui inverted dimmer ${error ? 'active' : ''}`} data-opacity="0">
                    <div className="content">
                        <div className="center" style={{color: 'red'}}>
                            <div className={`ui segment ${this.props.loading ? 'loading' : ''}`}
                                 style={{margin: 'auto', width: '50%'}}
                            >
                                This message wasn't send: one or more actions failed.
                                <div style={{margin: '1em auto'}}>
                                    <TicketMessageActions message={message} />
                                </div>
                                <a onClick={() => this.props.submit(null, null, 'retry', false)}>retry</a> to execute
                                the
                                failed action(s) automatically, and send the message if it succeeds,<br />
                                <a onClick={() => this.props.submit(null, null, 'force', false)}>ignore failure</a>,
                                execute
                                the other actions and send the message<br />
                                <a onClick={() => this.props.deleteMessage(message.id)}>cancel</a> the message, and
                                manually undo successful action(s).
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ticket-message-header">
                    <div className="ticket-message-header-details">
                        {
                            message.from_agent
                            && (
                                <span className="agent-label ui medium yellow label">A</span>
                            )
                        }

                        {
                            message.sender.name
                            && (
                                <span className="ticket-message-author ui small header">
                                    {message.sender.name}
                                </span>
                            )
                        }

                        {this.renderSource(message)}
                        {this.renderMeta(message)}
                    </div>
                    <div className="ticket-message-time">
                        <DatetimeLabel
                            dateTime={message.created_datetime}
                            settings={{
                                position: 'top left'
                            }}
                            timezone={this.props.currentUser.get('timezone')}
                        />
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
                <TicketMessageActions message={message} />
            </div>
        )
    }
}

TicketMessage.propTypes = {
    message: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    submit: PropTypes.func.isRequired,
    deleteMessage: PropTypes.func.isRequired,
    ticket: PropTypes.object,
    currentUser: PropTypes.object.isRequired
}
