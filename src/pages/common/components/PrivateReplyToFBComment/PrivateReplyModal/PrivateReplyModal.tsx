import React, {useCallback, useState} from 'react'
import {
    Button,
    Card,
    CardBody,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap'

import classnames from 'classnames'

import {fromJS} from 'immutable'

import Avatar from '../../../components/Avatar/Avatar'
import {FACEBOOK_MESSENGER_MESSAGE_MAX_LENGTH} from '../../../../../config/integrations/facebook'
import {Actor, Meta, Source} from '../../../../../models/ticket/types'
import {default as TicketMessageMeta} from '../../../../tickets/detail/components/TicketMessages/Meta.js'
import {DatetimeLabel} from '../../../utils/labels.js'
import facebookIcon from '../../../../../../img/integrations/facebook-feed-round-icon.svg'

import * as infobarActions from '../../../../../state/infobar/actions'

import css from './PrivateReplyModal.less'

type Props = {
    integrationId: number
    messageId: string
    ticketMessageId: number
    senderId: number
    isOpen: boolean
    ticketId: number
    facebookComment: string
    source: Source
    sender: Actor
    toggle: () => void
    meta?: Meta
    messageCreatedDatetime: string
    executeAction: typeof infobarActions.executeAction
}

export default function PrivateReplyModal({
    integrationId,
    messageId,
    ticketMessageId,
    senderId,
    isOpen,
    ticketId,
    facebookComment,
    source,
    sender,
    toggle,
    meta,
    messageCreatedDatetime,
    executeAction,
}: Props) {
    const {
        isSending,
        sendPrivateReply,
        inputOnChange,
        canSend,
    } = usePrivateReply(
        integrationId,
        messageId,
        ticketId,
        ticketMessageId,
        senderId,
        executeAction,
        facebookComment,
        toggle
    )

    const senderMeta = sender.meta ? fromJS(sender.meta) : fromJS({})

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                Message {sender.firstname} {sender.lastname}
            </ModalHeader>
            <ModalBody className="p-0">
                <Card className={css.commentCard}>
                    <CardBody>
                        <div className="row">
                            <div
                                className={classnames(
                                    'col-1',
                                    css.avatarContainer
                                )}
                            >
                                <Avatar
                                    email={sender.email}
                                    name={sender.name}
                                    url={senderMeta.get('profile_picture_url')} // eslint-disable-line
                                    size={36}
                                />
                            </div>
                            <div className="col-11">
                                <div
                                    className={classnames(
                                        'row',
                                        css.flexContainerRow,
                                        css.metaInfo
                                    )}
                                >
                                    <span className={css.customerNameBody}>
                                        {sender.firstname} {sender.lastname}
                                    </span>
                                    <img
                                        src={facebookIcon}
                                        className={css.facebookIcon}
                                        alt="Facebook icon"
                                    />
                                    <TicketMessageMeta
                                        messageId={messageId}
                                        meta={meta}
                                        source={source}
                                        integrationId={integrationId.toString()}
                                        via={''}
                                    />
                                    <div
                                        className={classnames(
                                            css.right,
                                            css.wrapper
                                        )}
                                    >
                                        <DatetimeLabel
                                            dateTime={messageCreatedDatetime}
                                        />
                                    </div>
                                </div>
                                <div
                                    className={classnames(
                                        'row',
                                        css.flexContainerColumn,
                                        css.facebookComment
                                    )}
                                >
                                    {facebookComment}
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <textarea
                    rows={4}
                    className={classnames(
                        'form-control',
                        css.privateReplyTextarea
                    )}
                    maxLength={FACEBOOK_MESSENGER_MESSAGE_MAX_LENGTH}
                    placeholder="Reply via Facebook Messenger..."
                    onChange={(e) => inputOnChange(e.target.value)}
                />
            </ModalBody>
            <ModalFooter className={css.modalFooter}>
                <Button
                    color="success"
                    id="private-reply-submit"
                    className={css.submit}
                    disabled={!canSend || isSending}
                    onClick={() => sendPrivateReply()}
                >
                    Send
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
    executeAction: typeof infobarActions.executeAction,
    body_text: string,
    toggle: () => void
) {
    const [isSending, setIsSending] = useState(false)
    const [privateReplyMessage, setPrivateReplyMessage] = useState('')
    const [canSend, setCanSend] = useState(false)

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

    const sendPrivateReply = () => {
        setIsSending(true)

        // TODO(@Mehdi) remove eslint and ts-ignore after checking
        //  how to do call executeAction properly (typing issue)
        // eslint-disable-next-line
        executeAction(
            'facebookPrivateReply',
            integrationId.toString(),
            senderId.toString(),
            {
                facebook_comment: body_text,
                messenger_reply: privateReplyMessage.trim(),
                from_ticket_message_id: ticketMessageId,
            }
            // @ts-ignore
        ).finally(() => {
            setIsSending(false)
            toggle()
        })
    }

    return {isSending, sendPrivateReply, inputOnChange, canSend}
}
