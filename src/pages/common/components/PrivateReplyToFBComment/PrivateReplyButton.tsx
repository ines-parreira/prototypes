import React, {useState} from 'react'
import {Button, UncontrolledTooltip} from 'reactstrap'
import moment from 'moment'
import classnames from 'classnames'

import messengerIcon from 'assets/img/integrations/facebook-messenger-dark-icon.svg'
import instagramDirectMessageIcon from 'assets/img/integrations/Instagram-direct-message-blue.svg'

import type {Actor, Meta, Source} from '../../../../models/ticket/types'

import PrivateReplyModal from './PrivateReplyModal/PrivateReplyModal'
import css from './PrivateReplyButton.less'

type Props = {
    integrationId: number
    messageId: string
    ticketMessageId: number
    senderId: number
    ticketId: number
    commentMessage: string
    source: Source
    sender: Actor
    meta?: Meta
    messageCreatedDatetime: string
    isFacebookComment: boolean
    className?: string
}

export default function PrivateReplyButton({
    integrationId,
    messageId,
    ticketMessageId,
    senderId,
    ticketId,
    commentMessage,
    source,
    sender,
    meta,
    messageCreatedDatetime,
    isFacebookComment,
    className,
}: Props) {
    const [isOpen, setOpen] = useState(false)
    const toggle = () => setOpen(!isOpen)
    const icon = isFacebookComment ? messengerIcon : instagramDirectMessageIcon
    const buttonText = isFacebookComment ? 'Message' : 'Direct message'

    let isAlreadySent = false

    // We can't send a private reply to a comment older than 7 days old
    const limit = moment().subtract(7, 'day') // 7 days ago
    const isMessageTooOld = moment(messageCreatedDatetime).isBefore(limit)

    let tooltipMessage =
        'Private replies are allowed within 7 days of the creation date of the comment'

    if (meta?.private_reply?.already_sent) {
        isAlreadySent = true
        tooltipMessage = 'Only one private reply per comment is allowed'
    }

    return (
        <>
            <Button
                className={classnames(css.container, className)}
                onClick={toggle}
                disabled={isAlreadySent || isMessageTooOld}
                id={`private-reply-button-${ticketMessageId}`}
                href="#"
            >
                <img
                    className={
                        isFacebookComment
                            ? css.messengerIcon
                            : css.instagramDirectMessageIcon
                    }
                    src={icon}
                    alt="private message icon"
                />
                {buttonText}
            </Button>
            {isOpen && (
                <PrivateReplyModal
                    integrationId={integrationId}
                    messageId={messageId}
                    ticketMessageId={ticketMessageId}
                    senderId={senderId}
                    isOpen={isOpen}
                    toggle={toggle}
                    ticketId={ticketId}
                    commentMessage={commentMessage}
                    source={source}
                    sender={sender}
                    meta={meta}
                    messageCreatedDatetime={messageCreatedDatetime}
                    isFacebookComment={isFacebookComment}
                />
            )}
            {(isAlreadySent || isMessageTooOld) && (
                <UncontrolledTooltip
                    target={`private-reply-button-${ticketMessageId}`}
                >
                    {tooltipMessage}
                </UncontrolledTooltip>
            )}
        </>
    )
}
