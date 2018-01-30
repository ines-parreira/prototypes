import React, {PropTypes} from 'react'
import moment from 'moment'
import {fromJS} from 'immutable'
import classnamesBind from 'classnames/bind'
import {isArray as _isArray} from 'lodash'
import {Popover, PopoverContent} from 'reactstrap'

import TicketMessageActions from './TicketMessageActions'
import TicketMessageBody from './TicketMessageBody'
import TicketAttachments from './replyarea/TicketAttachments'
import {displayUserNameFromSource} from '../../common/utils'
import {formatDatetime} from './../../../../utils'
import {DatetimeLabel, AgentLabel} from '../../../common/utils/labels'
import {getValuePropFromSourceType, isForwardedMessage} from '../../../../state/ticket/utils'
import HardWarning from './HardWarning'
import {sourceTypeToIcon} from './../../../../config/ticket'
import {scrollToReactNode} from '../../../common/utils/keyboard'

import Tooltip from '../../../common/components/Tooltip'

import css from './TicketMessage.less'

const classnames = classnamesBind.bind(css)

export default class TicketMessage extends React.Component {
    state = {
        infoDropdownOpen: false,
    }

    componentDidUpdate(prevProps) {
        // only if it just got the cursor.
        // to prevent focusing on the cursor item when a different one updates.
        if (this.props.hasCursor && !prevProps.hasCursor) {
            scrollToReactNode(this)
        }
    }

    _toggleInfoDropdown = () => {
        this.setState({infoDropdownOpen: !this.state.infoDropdownOpen})
    }

    renderAttachment(message) {
        if (message.attachments) {
            return (
                <TicketAttachments attachments={fromJS(message.attachments)}/>
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

        const source = Object.assign({
            type: '',
            from: {},
            to: []
        }, message.source)
        const iconLabel = isForwardedMessage(message) ? 'email-forward' : source.type

        let legend = ''
        const hasLegend = !source.type.startsWith('facebook')
            && source.type !== 'chat'
            && source.type !== 'api'
            && source.type !== 'system-message'

        if (!source.from) {
            if (['aircall', 'phone'].includes(source.type)) {
                legend = 'Unknown number'
            }
        } else if (hasLegend) {
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
                        className={`${sourceTypeToIcon(iconLabel)} uncolored`}
                    />
                    {
                        hasLegend && (
                            <span className="hidden-sm-down ml-1">
                                {legend}
                            </span>
                        )
                    }
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
        let refWidget = null

        if (message.meta && message.meta.current_page) {
            let displayString = message.meta.current_page

            if (displayString.length > 28) {
                displayString = `...${displayString.substr(displayString.length - 25)}`
            }

            fromWidget = (
                <span
                    key="from-widget"
                    className="hidden-sm-down ticket-message-from"
                >
                    from <a target="_blank" href={message.meta.current_page}>
                        {displayString}
                    </a>
                </span>
            )
        }

        if (message.source && message.source.type && message.source.extra &&
            ['facebook-post', 'facebook-comment'].includes(message.source.type)
        ) {
            const postId = message.source.extra.post_id
            const parentId = message.source.extra.parent_id
            let messageId = message.message_id

            const isPost = message.source.type === 'facebook-post'
            const isComment = parentId === postId

            let type = 'reply'

            if (isPost) {
                type = 'post'
                messageId = postId
            } else if (isComment) {
                type = 'comment'
            }

            refWidget = (
                <span
                    key="ref-widget"
                    className="hidden-sm-down ticket-message-from"
                >
                    go to {' '}
                    <a
                        target="_blank"
                        href={`https://facebook.com/${messageId}`}
                    >
                        {type}
                    </a>
                </span>
            )
        }

        if (message.via === 'rule') {
            viaWidget = (
                <span
                    key="via-widget"
                    className="hidden-sm-down ticket-message-from"
                >
                    sent via a <b><i className="fa fa-fw fa-cog mr-1" /> Rule</b>
                </span>
            )
        }

        return [
            refWidget,
            fromWidget,
            viaWidget
        ]
    }

    /**
     * Message never arrived to server
     * @returns {XML}
     * @private
     */
    _renderMessageNotSent() {
        const {message, ticket, setStatus} = this.props

        return (
            <HardWarning
                error="This message was not sent: error while sending the message."
                message={fromJS(message)}
                messageId={message.id}
                ticketId={message.ticket_id || ticket.get('id')}
                setStatus={setStatus}
                retry
                cancel
            />
        )
    }

    /**
     * Message could not be sent to customer by server
     * @returns {XML}
     * @private
     */
    _renderActionFailed() {
        const {message, ticket} = this.props

        return (
            <HardWarning
                error="This message was not sent: one or more actions failed."
                retryTooltipMessage="Retry to execute the failed action(s) automatically, and send the message if it succeeds."
                messageId={message.id}
                ticketId={message.ticket_id || ticket.get('id')}
                messageActions={message.actions}
                retry
                force
                cancel
            />
        )
    }

    render() {
        const {message, timezone, isLastReadMessage} = this.props

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
        // appear animation if message is created after the ticket body component is mounted
        const appear = !!this.props.lastMessageDatetimeAfterMount
            && !message.from_agent
            && moment(message.created_datetime).diff(this.props.lastMessageDatetimeAfterMount) > 0

        const className = classnames('ticket-message', css.component,
            {
                'ticket-message-agent': message.from_agent,
                internal: !message.public,
                appear,
                'ticket-message-loading': loading
            }
        )

        return (
            <div className={className}>
                {
                    !loading && error && this._renderActionFailed()
                }
                {
                    !loading && message.failed_datetime && this._renderMessageNotSent()
                }
                <div className={classnames('ticket-message-header', css.header)}>
                    <div className="ticket-message-header-details">
                        {message.from_agent && <AgentLabel />}

                        {
                            message.sender.name
                            && (
                                <span className="ticket-message-author">
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
                        {
                            message.from_agent && isLastReadMessage && (
                                <span>
                                    <i
                                        id="read-status"
                                        className="fa fa-check mr-2"
                                    />
                                    <Tooltip
                                        placement="top"
                                        target="read-status"
                                    >
                                        Seen by customer{' '}
                                        {formatDatetime(message.opened_datetime, timezone).toLowerCase()}
                                    </Tooltip>
                                </span>
                            )
                        }
                        <DatetimeLabel
                            dateTime={message.created_datetime}
                            settings={{
                                position: 'top left'
                            }}
                            timezone={timezone}
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
    timezone: PropTypes.string,
    lastMessageDatetimeAfterMount: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    setStatus: PropTypes.func.isRequired,
    isLastReadMessage: PropTypes.bool,
    hasCursor: PropTypes.bool,
}
