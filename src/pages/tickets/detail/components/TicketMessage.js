import React, {PropTypes} from 'react'
import {List} from 'immutable'
import classnames from 'classnames'
import {isArray as _isArray} from 'lodash'
import {Popover, PopoverContent} from 'reactstrap'
import TicketMessageActions from './TicketMessageActions'
import TicketMessageBody from './TicketMessageBody'
import TicketAttachments from './replyarea/TicketAttachments'
import {displayUserNameFromSource} from '../../common/utils'
import {DatetimeLabel, AgentLabel} from '../../../common/utils/labels'
import {getValuePropFromSourceType} from '../../../../state/ticket/utils'
import HardWarning from './HardWarning'

import css from './TicketMessage.less'

export default class TicketMessage extends React.Component {
    state = {
        infoDropdownOpen: false,
    }

    _toggleInfoDropdown = () => {
        this.setState({infoDropdownOpen: !this.state.infoDropdownOpen})
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
            <li>
                <span className="text-faded">{title}:</span>
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
            phone: 'phone',
            'ottspott-call': 'phone',
            'facebook-message': 'facebook-messenger',
            'facebook-comment': 'facebook square',
            'facebook-post': 'facebook square',
            'system-message': 'setting'
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
            && source.type !== 'system-message'

        if (hasLegend) {
            legend = `${source.from[getValuePropFromSourceType(source.type)]}`
        }

        const id = `info-${message.id}`

        return (
            <div>
                <span
                    className={classnames('text-faded', 'clickable', css.source)}
                    onClick={this._toggleInfoDropdown}
                >
                    <i
                        id={id}
                        className={`icon ${icons[source.type]}`}
                    />
                    {legend}
                </span>
                <Popover
                    placement="bottom"
                    target={id}
                    isOpen={this.state.infoDropdownOpen}
                    toggle={this._toggleInfoDropdown}
                >
                    <PopoverContent>
                        <div className="ticket-message-source-details">
                            <ul className="item">
                                {this.renderSourceList(source, 'From', 'from')}
                                {this.renderSourceList(source, 'To', 'to')}
                                {this.renderSourceList(source, 'Cc', 'cc')}
                                {this.renderSourceList(source, 'Bcc', 'bcc')}
                                <li>
                                    <span className="text-faded">Send via:</span>
                                    <strong>
                                        {source.type}
                                    </strong>
                                </li>
                                <li>
                                    <span className="text-faded">Date:</span>
                                    <strong>{message.created_datetime}</strong>
                                </li>
                            </ul>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        )
    }

    renderMeta(message) {
        let fromWidget = null
        let viaWidget = null

        if (message.meta && message.meta.current_page) {
            let displayString = message.meta.current_page

            if (displayString.length > 28) {
                displayString = `...${displayString.substr(displayString.length - 25)}`
            }

            fromWidget = (
                <span key="from-widget" className="ticket-message-from">
                    from <a target="_blank" href={message.meta.current_page}>
                        {displayString}
                    </a>
                </span>
            )
        }

        if (message.via === 'rule') {
            viaWidget = (
                <span key="via-widget" className="ticket-message-from">
                    sent via a <b><i className="icon setting" />Rule</b>
                </span>
            )
        }

        return [
            fromWidget,
            viaWidget
        ]
    }

    _renderMessageNotSent(messageId, ticketId) {
        return (
            <HardWarning
                message="This message was not sent: error while sending the message."
                messageId={messageId}
                ticketId={ticketId}
                retry cancel
            />
        )
    }

    _renderActionFailed(messageId, ticketId, messageActions) {
        const rMsg = 'Retry to execute the failed action(s) automatically, and send the message if it succeeds.'
        return (
            <HardWarning
                message="This message was not sent: one or more actions failed."
                retryTooltipMessage={rMsg}
                messageId={messageId}
                ticketId={ticketId}
                messageActions={messageActions}
                retry force cancel
            />
        )
    }

    render() {
        const {message, ticket} = this.props

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

        const loading = (pending && !error) || this.props.loading

        const className = classnames('ui raw segment ticket-message', css.component,
            {
                'ticket-message-agent': message.from_agent,
                internal: !message.public,
                loading
            }
        )

        return (
            <div className={className}>
                {
                    !loading && error && this._renderActionFailed(message.id, ticket.get('id'), message.actions)
                }
                {
                    !loading && message.failed_datetime && this._renderMessageNotSent(message.id, ticket.get('id'))
                }
                <div className={classnames('ticket-message-header', css.header)}>
                    <div className="ticket-message-header-details">
                        {message.from_agent && <AgentLabel />}

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
                    <span
                        className="text-faded pull-right"
                        style={{
                            fontWeight: '600',
                            fontSize: '13px'
                        }}
                    >
                        <DatetimeLabel
                            dateTime={message.created_datetime}
                            settings={{
                                position: 'top left'
                            }}
                            timezone={this.props.currentUser.get('timezone')}
                        />
                    </span>
                </div>
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
    ticket: PropTypes.object,
    currentUser: PropTypes.object.isRequired
}
