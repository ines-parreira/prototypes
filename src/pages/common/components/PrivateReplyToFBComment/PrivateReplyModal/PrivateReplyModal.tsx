import React, {useCallback, useState} from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'

import classnames from 'classnames'

import {connect, ConnectedProps} from 'react-redux'

import {FACEBOOK_MESSENGER_MESSAGE_MAX_LENGTH} from '../../../../../config/integrations/facebook'
import {Actor, Meta, Source} from '../../../../../models/ticket/types'

import * as infobarActions from '../../../../../state/infobar/actions'

import TicketMessageEmbeddedCard from '../../TicketMessageEmbeddedCard/TicketMessageEmbeddedCard'
import {StoreDispatch} from '../../../../../state/types'
import {goToNextTicket, setStatus} from '../../../../../state/ticket/actions'
import {COMMENT_TICKET_PRIVATE_REPLY_EVENT} from '../../../../tickets/detail/components/PrivateReplyEvent/constants'

import css from './PrivateReplyModal.less'

type OwnProps = {
    integrationId: number
    messageId: string
    ticketMessageId: number
    senderId: number
    isOpen: boolean
    ticketId: number
    commentMessage: string
    source: Source
    sender: Actor
    toggle: () => void
    meta?: Meta
    messageCreatedDatetime: string
    isFacebookComment: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

function PrivateReplyModal({
    integrationId,
    messageId,
    ticketMessageId,
    senderId,
    isOpen,
    ticketId,
    commentMessage,
    source,
    sender,
    toggle,
    meta,
    messageCreatedDatetime,
    executePrivateReplyAction,
    isFacebookComment,
    goToNextTicket,
    setClosedStatus,
}: Props) {
    const {isSending, sendPrivateReply, inputOnChange, canSend} =
        usePrivateReply(
            integrationId,
            messageId,
            ticketId,
            ticketMessageId,
            senderId,
            executePrivateReplyAction,
            commentMessage,
            toggle,
            isFacebookComment,
            source,
            sender,
            messageCreatedDatetime,
            setClosedStatus,
            goToNextTicket,
            meta
        )

    const placeholder = isFacebookComment
        ? 'Reply via Facebook Messenger'
        : 'Reply via Instagram direct message'
    const modalHeaderText = isFacebookComment ? 'Message' : 'Direct message'

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                {modalHeaderText} {sender.firstname} {sender.lastname}
            </ModalHeader>
            <ModalBody className="p-0">
                <TicketMessageEmbeddedCard
                    integrationId={integrationId}
                    messageId={messageId}
                    messageText={commentMessage}
                    source={source}
                    sender={sender}
                    meta={meta}
                    messageCreatedDatetime={messageCreatedDatetime}
                    textBelowAvatar={false}
                />
                <textarea
                    rows={4}
                    className={classnames(
                        'form-control',
                        css.privateReplyTextarea
                    )}
                    maxLength={FACEBOOK_MESSENGER_MESSAGE_MAX_LENGTH}
                    placeholder={placeholder}
                    onChange={(e) => inputOnChange(e.target.value)}
                />
            </ModalBody>
            <ModalFooter className={css.modalFooter}>
                <Button
                    color="success"
                    id="private-reply-submit"
                    className={classnames(css.submit, css.send)}
                    disabled={!canSend || isSending}
                    onClick={() => sendPrivateReply(false)}
                >
                    Send
                </Button>
                <Button
                    color="secondary"
                    id="send-private-reply-and-close-button"
                    className={classnames(css.submit, css.sendAndClose)}
                    disabled={!canSend || isSending}
                    onClick={() => sendPrivateReply(true)}
                >
                    Send &amp; Close
                </Button>
            </ModalFooter>
        </Modal>
    )
}

function usePrivateReply(
    integrationId: number,
    messageId: string,
    ticket_id: number,
    ticketMessageId: number,
    senderId: number,
    executePrivateReplyAction: Props['executePrivateReplyAction'],
    comment: string,
    toggle: () => void,
    isFacebookComment: boolean,
    source: Source,
    sender: Actor,
    messageCreatedDatetime: string,
    setClosedStatus: Props['setClosedStatus'],
    goToNextTicket: Props['goToNextTicket'],
    meta?: Meta
) {
    const [isSending, setIsSending] = useState(false)
    const [privateReplyMessage, setPrivateReplyMessage] = useState('')
    const [canSend, setCanSend] = useState(false)
    const actionName = isFacebookComment
        ? 'facebookPrivateReply'
        : 'instagramPrivateReply'

    const commonPayload = {
        message_id: messageId,
        from_ticket_message_id: ticketMessageId,
        comment_message_source: source,
        comment_message_sender: sender,
        comment_message_meta: meta,
        comment_message_datetime: messageCreatedDatetime,
        private_reply_event_type: COMMENT_TICKET_PRIVATE_REPLY_EVENT,
    }

    const specificPayload = isFacebookComment
        ? {
              facebook_comment: comment,
              messenger_reply: privateReplyMessage.trim(),
          }
        : {
              instagram_comment: comment,
              instagram_direct_message_reply: privateReplyMessage.trim(),
          }

    const actionPayload = {...commonPayload, ...specificPayload}

    const inputOnChange = useCallback(
        (value: string) => {
            setPrivateReplyMessage(value)

            if (value.trim() && value.trim().length > 0) {
                setCanSend(true)
            } else {
                setCanSend(false)
            }
        },
        [setPrivateReplyMessage, setCanSend]
    )

    const sendPrivateReply = (sendAndClose: boolean) => {
        setIsSending(true)

        executePrivateReplyAction(
            actionName,
            integrationId,
            senderId,
            actionPayload
        )
            .then(sendAndClose ? void setClosedStatus() : null)
            .finally(() => {
                setIsSending(false)
                toggle()
                if (sendAndClose) {
                    void goToNextTicket()
                }
            })
    }

    return {isSending, sendPrivateReply, inputOnChange, canSend}
}

const mapDispatchToProps = (dispatch: StoreDispatch, props: OwnProps) => ({
    goToNextTicket: () => dispatch(goToNextTicket(props.ticketId)),
    setClosedStatus: () => dispatch(setStatus('closed')),
    executePrivateReplyAction: (
        actionName: string,
        integrationId: number,
        senderId: number,
        actionPayload: any
    ) =>
        dispatch(
            infobarActions.executeAction(
                actionName,
                integrationId.toString(),
                senderId.toString(),
                actionPayload
            )
        ),
})

const connector = connect(null, mapDispatchToProps)

export default connector(PrivateReplyModal)
