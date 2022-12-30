import React, {useState} from 'react'
import {fromJS, Map} from 'immutable'
import classnames from 'classnames'
import {Card, CardBody} from 'reactstrap'
import {useFlags} from 'launchdarkly-react-client-sdk'

import facebookIcon from 'assets/img/integrations/facebook-dark-icon.svg'
import facebookMessengerIcon from 'assets/img/integrations/facebook-messenger-dark-event-icon.svg'
import InstagramDirectMessageIcon from 'assets/img/integrations/Instagram-direct-message-blue-filled.svg'
import InstagramIcon from 'assets/img/integrations/instagram-icon-blue.svg'

import TicketMessageEmbeddedCard from 'pages/common/components/TicketMessageEmbeddedCard/TicketMessageEmbeddedCard'
import IconButton from 'pages/common/components/button/IconButton'
import {Actor, Meta, Source} from 'models/ticket/types'
import {AgentLabel, DatetimeLabel} from 'pages/common/utils/labels'
import {FeatureFlagKey} from 'config/featureFlags'

import {renderDetails} from '../Event'
import css from './PrivateReplyEvent.less'
import {
    COMMENT_TICKET_PRIVATE_REPLY_EVENT,
    FACEBOOK_PRIVATE_REPLY_ACTION,
    INSTAGRAM_PRIVATE_REPLY_ACTION,
    MESSAGING_TICKET_PRIVATE_REPLY_EVENT,
} from './constants'

type Props = {
    event: Map<string, any>
    isLast: boolean
}

enum PrivateReplyType {
    FacebookPrivateReply,
    InstagramPrivateReply,
}

enum PrivateReplyEventType {
    PrivateReplyEventInCommentTicket,
    PrivateReplyEventInMessagingTicket,
}

class PrivateReplyEventManager {
    event: Map<string, any>
    privateReplyType: PrivateReplyType
    privateReplyEventType: PrivateReplyEventType
    isError: boolean

    private static eventToPrivateReplyType(event: Map<string, any>) {
        switch (event.getIn(['data', 'action_name'], '')) {
            case FACEBOOK_PRIVATE_REPLY_ACTION: {
                return PrivateReplyType.FacebookPrivateReply
            }
            case INSTAGRAM_PRIVATE_REPLY_ACTION: {
                return PrivateReplyType.InstagramPrivateReply
            }
            default:
                return PrivateReplyType.FacebookPrivateReply
        }
    }

    private static eventToPrivateReplyEventType(event: Map<string, any>) {
        switch (
            event.getIn(['data', 'payload', 'private_reply_event_type'], '')
        ) {
            case COMMENT_TICKET_PRIVATE_REPLY_EVENT: {
                return PrivateReplyEventType.PrivateReplyEventInCommentTicket
            }
            case MESSAGING_TICKET_PRIVATE_REPLY_EVENT: {
                return PrivateReplyEventType.PrivateReplyEventInMessagingTicket
            }
            default:
                return PrivateReplyEventType.PrivateReplyEventInCommentTicket
        }
    }

    constructor(event: Map<string, any>) {
        this.event = event
        this.isError = event.getIn(['data', 'status']) === 'error'
        this.privateReplyType =
            PrivateReplyEventManager.eventToPrivateReplyType(event)
        this.privateReplyEventType =
            PrivateReplyEventManager.eventToPrivateReplyEventType(event)
    }

    public getComment() {
        return (
            this.privateReplyType === PrivateReplyType.FacebookPrivateReply
                ? this.event.getIn(['data', 'payload', 'facebook_comment'])
                : this.event.getIn(['data', 'payload', 'instagram_comment'])
        ) as string
    }

    public shouldDisplayCommentCard() {
        if (this.isError) {
            return false
        }
        return (
            this.privateReplyEventType ===
            PrivateReplyEventType.PrivateReplyEventInMessagingTicket
        )
    }

    public getEventData() {
        if (this.privateReplyType === PrivateReplyType.FacebookPrivateReply) {
            if (
                this.privateReplyEventType ===
                PrivateReplyEventType.PrivateReplyEventInCommentTicket
            ) {
                return {
                    actionLabel: 'Responded via Facebook Messenger',
                    privateReplyTicketId: this.event.getIn([
                        'data',
                        'messenger_ticket_id',
                    ]) as string,
                    icon: facebookMessengerIcon,
                }
            }
            return {
                actionLabel: 'Responding to a Facebook comment',
                privateReplyTicketId: this.event.getIn([
                    'data',
                    'facebook_comment_ticket_id',
                ]) as string,
                icon: facebookIcon,
            }
        }
        if (
            this.privateReplyEventType ===
            PrivateReplyEventType.PrivateReplyEventInCommentTicket
        ) {
            return {
                actionLabel: 'Responded via Instagram Direct Message',
                privateReplyTicketId: this.event.getIn([
                    'data',
                    'instagram_direct_message_ticket_id',
                ]) as string,
                icon: InstagramDirectMessageIcon,
            }
        }
        return {
            actionLabel: 'Responding to an Instagram comment',
            privateReplyTicketId: this.event.getIn([
                'data',
                'instagram_comment_ticket_id',
            ]) as string,
            icon: InstagramIcon,
        }
    }
}

export default function PrivateReplyEvent({event, isLast}: Props): JSX.Element {
    // TODO: refactor after Virtualization is rolled out
    const isVirtualizationEnabled =
        useFlags()[FeatureFlagKey.TicketMessagesVirtualization]

    const [displayErrorDetails, setDisplayErrorDetails] = useState(false)
    const privateReplyEventManager = new PrivateReplyEventManager(event)
    const user = (event.get('user') || fromJS({})) as Map<any, any>

    let eventIcon
    let viewTicketLink
    let eventDetails
    let errorDetails
    let expandButton

    const eventData = privateReplyEventManager.getEventData()

    if (privateReplyEventManager.isError) {
        eventIcon = (
            <div className={classnames(css.icon, css.danger)} title={'Fail'}>
                <i className="material-icons">close</i>
            </div>
        )

        expandButton = (
            <IconButton
                fillStyle="ghost"
                intent="secondary"
                onClick={() => setDisplayErrorDetails(!displayErrorDetails)}
                title="More details"
            >
                {displayErrorDetails ? 'expand_less' : 'expand_more'}
            </IconButton>
        )

        errorDetails = (
            <Card
                className={classnames(css.errorDetails, {
                    'd-none': !displayErrorDetails,
                })}
            >
                <CardBody>{renderDetails(true, event.get('data'))}</CardBody>
            </Card>
        )
    } else if (!!eventData) {
        eventIcon = (
            <div className={css.privateReplyEventIcon}>
                <img
                    src={eventData.icon}
                    alt="private reply event"
                    key="private-reply-event"
                />
            </div>
        )

        if (!!eventData.privateReplyTicketId) {
            viewTicketLink = (
                <div>
                    <span className={css.separator}>-</span>
                    <span className={css.ticketLink}>
                        <a
                            href={`${eventData.privateReplyTicketId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View ticket
                        </a>
                    </span>
                </div>
            )
        }

        if (privateReplyEventManager.shouldDisplayCommentCard()) {
            const messageId = event.getIn([
                'data',
                'payload',
                'message_id',
            ]) as string
            const integrationId = event.getIn([
                'data',
                'integration_id',
            ]) as number

            const commentMessageDatetime = event.getIn([
                'data',
                'payload',
                'comment_message_datetime',
            ]) as string

            const source = (event.getIn([
                'data',
                'payload',
                'comment_message_source',
            ]) || fromJS({})) as Map<any, any>
            const commentMessageSource = source.toJS() as Source

            const sender = (event.getIn([
                'data',
                'payload',
                'comment_message_sender',
            ]) || fromJS({})) as Map<any, any>
            const commentMessageSender = sender.toJS() as Actor

            const meta = (event.getIn([
                'data',
                'payload',
                'comment_message_meta',
            ]) || fromJS({})) as Map<any, any>
            const commentMessageMeta = meta.toJS() as Meta

            eventDetails = (
                <div className={css.eventDetails}>
                    <TicketMessageEmbeddedCard
                        integrationId={integrationId}
                        messageId={messageId}
                        messageText={privateReplyEventManager.getComment()}
                        source={commentMessageSource}
                        sender={commentMessageSender}
                        meta={commentMessageMeta}
                        messageCreatedDatetime={commentMessageDatetime}
                        textBelowAvatar={false}
                    />
                </div>
            )
        }
    }

    return (
        <div
            className={classnames(css.component, {
                [css.isVirtualized]: isVirtualizationEnabled,
                [css.last]: isLast,
            })}
        >
            <div className={css.event}>
                <div className={css.content}>
                    {eventIcon}
                    <span className={css.actionName}>
                        {!!eventData
                            ? eventData.actionLabel
                            : 'Private reply action'}
                    </span>

                    <span className={css.filler}>by</span>

                    <AgentLabel name={user.get('name')} />
                    {privateReplyEventManager.isError
                        ? expandButton
                        : viewTicketLink}
                </div>

                <DatetimeLabel
                    dateTime={event.get('created_datetime')}
                    className={classnames(css.date, 'text-faded')}
                />
            </div>
            {privateReplyEventManager.isError ? errorDetails : eventDetails}
        </div>
    )
}
