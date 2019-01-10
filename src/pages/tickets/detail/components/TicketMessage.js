import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {fromJS} from 'immutable'
import classnamesBind from 'classnames/bind'
import {isArray as _isArray} from 'lodash'
import {Popover, PopoverBody} from 'reactstrap'

import * as infobarActions from './../../../../state/infobar/actions'

import TicketMessageActions from './TicketMessageActions'
import TicketMessageBody from './TicketMessageBody'
import TicketAttachments from './replyarea/TicketAttachments'
import {getPersonLabelFromSource} from '../../common/utils'
import {formatDatetime} from './../../../../utils'
import {AgentLabel, CustomerLabel, DatetimeLabel} from '../../../common/utils/labels'
import {isForwardedMessage} from '../../../../state/ticket/utils'
import TicketMessageError from './TicketMessageError'
import Avatar from '../../../common/components/Avatar'
import {scrollToReactNode} from '../../../common/utils/keyboard'
import SourceIcon from '../../../common/components/SourceIcon'

import Tooltip from '../../../common/components/Tooltip'

import css from './TicketMessage.less'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {EMAIL_CHANNEL, INTERNAL_NOTE_SOURCE} from '../../../../config/ticket'

const classnames = classnamesBind.bind(css)

export class TicketMessage extends React.Component {
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
        const attachments = fromJS(message.attachments || [])
        if (attachments.size) {
            return (
                <div className="pt-4">
                    <span className={css.attachmentsLabel}>
                        <i className="icon mr-1 material-icons">
                            attachment
                        </i>
                        New media files
                    </span>
                    <TicketAttachments attachments={attachments}/>
                </div>
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
                        fieldSource.map((person) => {
                            return getPersonLabelFromSource(person, source.type)
                        }).join(', ')
                    }
                </strong>
            </li>
        )
    }

    renderSource(message) {
        const source = Object.assign({
            type: '',
            from: {},
            to: []
        }, message.source)
        const iconLabel = isForwardedMessage(message) ? 'email-forward' : source.type

        const id = `info-${message.id}`

        return (
            <div>
                <span
                    className={classnames('clickable', css.source)}
                    onClick={this._toggleInfoDropdown}
                >
                    <SourceIcon
                        id={id}
                        type={iconLabel}
                        className="uncolored"
                    />
                </span>
                <Popover
                    placement="bottom"
                    target={id}
                    isOpen={this.state.infoDropdownOpen}
                    toggle={this._toggleInfoDropdown}
                >
                    <PopoverBody>
                        <div className={css.sourceDetails}>
                            <ul>
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
                                    <strong>
                                        <DatetimeLabel
                                            dateTime={message.created_datetime}
                                            labelFormat='MM-DD-YYYY HH:mm'
                                        />
                                    </strong>
                                </li>
                            </ul>
                        </div>
                    </PopoverBody>
                </Popover>
            </div>
        )
    }

    _toggleInstagramHideComment = (hide) => {
        const {message, executeAction} = this.props

        executeAction(hide ? 'instagramHideComment' : 'instagramUnhideComment',
            message.integration_id,
            undefined,
            {'comment_id': message.message_id})
    }

    _toggleFacebookHideComment = (hide) => {
        const {message, executeAction} = this.props

        executeAction(hide ? 'facebookHideComment' : 'facebookUnhideComment',
            message.integration_id,
            undefined,
            {'comment_id': message.message_id})
    }

    _toggleLikeComment = (like) => {
        const {message, executeAction} = this.props

        executeAction(like ? 'facebookLikeComment' : 'facebookUnlikeComment',
            message.integration_id,
            undefined,
            {'comment_id': message.message_id})
    }

    renderMeta(message) {
        const widgets = []

        if (message.meta && message.meta.current_page) {
            let displayString = message.meta.current_page

            if (displayString.length > 28) {
                displayString = `...${displayString.substr(displayString.length - 25)}`
            }

            widgets.push(
                <span
                    key="from-widget"
                    className={classnames(css.from, 'd-none d-md-inline-block')}
                >
                    from <a
                        target="_blank"
                        href={message.meta.current_page}
                    >
                        {displayString}
                    </a>
                </span>
            )
        }

        if (message.source && message.source.type && message.source.extra &&
            ['facebook-post', 'facebook-comment', 'instagram-media'].includes(message.source.type)
        ) {
            const postId = message.source.extra.post_id
            const parentId = message.source.extra.parent_id
            const messageId = message.message_id
            const permalink = message.source.extra.permalink

            const isFacebookPost = message.source.type === 'facebook-post'
            const isFacebookComment = parentId === postId
            const isInstagramMedia = message.source.type === 'instagram-media'

            let type = 'reply'
            let link = `https://facebook.com/${messageId}`

            if (isFacebookPost) {
                type = 'post'
                link = `https://facebook.com/${postId}`
            } else if (isInstagramMedia) {
                type = 'media'
                link = permalink
            } else if (isFacebookComment) {
                type = 'comment'
                link = `https://facebook.com/${messageId}`
            }

            widgets.push(
                <span
                    key="ref-widget"
                    className={classnames(css.from, 'd-none d-md-inline-block')}
                >
                    go to{' '}
                    <a
                        target="_blank"
                        href={link}
                    >
                        {type}
                    </a>
                </span>
            )
        }

        let sentViaLabel
        let sentViaLink
        let sentViaPronoun = 'a '

        if (message.via === 'rule') {
            sentViaLabel = 'Rule'
            sentViaLink = `/app/settings/rules?ruleId=${message.rule_id}`
        } else if (message.meta && message.meta.campaign_id) {
            sentViaLabel = 'Campaign'
            sentViaLink = `/app/settings/integrations/smooch_inside/${message.integration_id}/campaigns/${message.meta.campaign_id}`
        } else if (message.source.type === INTERNAL_NOTE_SOURCE && message.via === EMAIL_CHANNEL) {
            sentViaLabel = 'email'
            sentViaPronoun = ''
        }

        if (sentViaLabel) {
            widgets.push(
                <span
                    key="via-widget"
                    className={classnames(css.from, 'd-none d-md-inline-block')}
                >
                    sent via{sentViaPronoun? ` ${sentViaPronoun} ` : ' '}
                    {
                        sentViaLink ? (
                            <b>
                                <Link
                                    tag="a"
                                    to={sentViaLink}
                                >
                                    <i className="material-icons mr-1">
                                        settings
                                    </i>
                                    {sentViaLabel}
                                </Link>
                            </b>
                        ) : sentViaLabel
                    }
                </span>
            )
        }

        return widgets
    }

    renderActions(message) {
        const widgets = []

        if (!message.source || !message.source.type) {
            return widgets
        }

        const isInstagramComment = message.source.type === 'instagram-comment'
        const isFacebookComment = message.source.type === 'facebook-comment'
        const isFromAgent = message.from_agent

        // If the comment is a Facebook comment, posted by the page, then the API will never allow us to hide it.
        // So we don't even display the `hide` button to avoid frustration.
        if (isInstagramComment || (isFacebookComment && !isFromAgent)) {
            let hiddenDatetime = null

            if (message.meta && message.meta.hidden_datetime) {
                hiddenDatetime = message.meta.hidden_datetime
            }

            const shouldHide = !hiddenDatetime

            widgets.push(
                <span
                    key="hide-action"
                    className={classnames('hidden-sm-down', css.actionButton)}
                    onClick={() => isInstagramComment
                        ? this._toggleInstagramHideComment(shouldHide)
                        : this._toggleFacebookHideComment(shouldHide)
                    }
                >
                    {shouldHide ? 'Hide' : 'Unhide'}
                </span>
            )
        }

        if (isFacebookComment) {
            let likedDatetime = null

            if (message.meta && message.meta.liked_datetime) {
                likedDatetime = message.meta.liked_datetime
            }

            const shouldHide = !likedDatetime

            widgets.push(
                <span
                    key="like-action"
                    className={classnames('hidden-sm-down', css.actionButton)}
                    onClick={() => this._toggleLikeComment(shouldHide)}
                >
                    {shouldHide ? 'Like' : 'Unlike'}
                </span>
            )
        }

        return widgets
    }

    /**
     * Message never arrived to server
     * @returns {XML}
     * @private
     */
    _renderMessageNotSent() {
        const {message, ticket, setStatus} = this.props

        let error = 'This message was not sent.'

        if (message.meta && message.meta.error) {
            error = message.meta.error
        }

        return (
            <TicketMessageError
                error={error}
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
            <TicketMessageError
                error="This message was not sent because one or more actions failed while sending it."
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

        let hasActionError = false
        let isPending = false

        if (message.actions) {
            for (const action of message.actions) {
                if (action.status === 'error') {
                    hasActionError = true
                    break
                } else if (action.status === 'pending') {
                    isPending = true
                }
            }
        }

        const loading = (isPending && !hasActionError) || this.props.loading
        // appear animation if message is created after the ticket body component is mounted
        const appear = !!this.props.lastMessageDatetimeAfterMount
            && !message.from_agent
            && moment(message.created_datetime).diff(this.props.lastMessageDatetimeAfterMount) > 0

        const className = classnames('ticket-message', css.component,
            {
                [css.fromAgent]: message.from_agent,
                [css.internal]: !message.public,
                [css.appear]: appear,
                'ticket-message-loading': loading
            }
        )

        const sender = fromJS(message.sender || {})
        const hasError = (!loading && (hasActionError || message.failed_datetime))

        return (
            <div className={classnames(className, {
                [css.hasError]: hasError
            })}>
                <div className={css.avatar}>
                    <Avatar
                        email={sender.get('email')}
                        name={sender.get('name')}
                        url={sender.getIn(['meta', 'profile_picture_url'])}
                        size="36"
                    />
                </div>
                <div className={css.body}>
                    <div className={css.header}>
                        <div className={css.headerDetails}>
                            <div className={classnames(css.author, {
                                isAgent: message.from_agent
                            })}>
                                {
                                    message.from_agent ? (
                                        <AgentLabel
                                            name={sender.get('name')}
                                            className={css.agentIcon}
                                        />
                                    ) : <CustomerLabel customer={sender} />
                                }
                            </div>

                            {this.renderSource(message)}
                            {this.renderMeta(message)}
                        </div>
                        <span className={classnames(css.date, 'text-faded float-right')}>
                            {this.renderActions(message)}
                            {
                                message.from_agent && isLastReadMessage && (
                                    <span>
                                        <i
                                            id="read-status"
                                            className="material-icons mr-2"
                                        >
                                            check
                                        </i>
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
                                timezone={timezone}
                            />
                        </span>
                    </div>
                    <TicketMessageBody
                        className={css.messageContent}
                        message={message}
                    />
                    {this.renderAttachment(message)}
                    <TicketMessageActions message={message}/>
                    {
                        !loading && hasActionError && this._renderActionFailed()
                    }
                    {
                        !loading && message.failed_datetime && this._renderMessageNotSent()
                    }
                </div>
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
    executeAction: PropTypes.func,
    isLastReadMessage: PropTypes.bool,
    hasCursor: PropTypes.bool,
}

export default connect(null, {executeAction: infobarActions.executeAction})(TicketMessage)
