import React, {useState} from 'react'

import {Button, UncontrolledTooltip} from 'reactstrap'

import moment from 'moment'

import messengerIcon from '../../../../../img/integrations/facebook-messenger-dark-icon.svg'
import type {Actor, Meta, Source} from '../../../../models/ticket/types'

import * as infobarActions from '../../../../state/infobar/actions'

import PrivateReplyModal from './PrivateReplyModal/PrivateReplyModal'

import css from './PrivateReplyButton.less'

type Props = {
    integrationId: number
    messageId: string
    ticketMessageId: number
    senderId: number
    ticketId: number
    facebookComment: string
    source: Source
    sender: Actor
    meta?: Meta
    messageCreatedDatetime: string
    executeAction: typeof infobarActions.executeAction
}

export default function PrivateReplyButton({
    integrationId,
    messageId,
    ticketMessageId,
    senderId,
    ticketId,
    facebookComment,
    source,
    sender,
    meta,
    messageCreatedDatetime,
    executeAction,
}: Props) {
    const [isOpen, setOpen] = useState(false)
    const toggle = () => setOpen(!isOpen)

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
                className={css.container}
                onClick={toggle}
                disabled={isAlreadySent || isMessageTooOld}
                id={`private-reply-button-${ticketMessageId}`}
                href="#"
            >
                <img
                    className={css.messengerIcon}
                    src={messengerIcon}
                    alt="Messenger icon"
                />
                Message
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
                    facebookComment={facebookComment}
                    source={source}
                    sender={sender}
                    meta={meta}
                    messageCreatedDatetime={messageCreatedDatetime}
                    executeAction={executeAction}
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
