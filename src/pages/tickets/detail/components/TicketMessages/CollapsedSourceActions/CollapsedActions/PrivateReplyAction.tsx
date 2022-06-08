import React from 'react'

import messengerIcon from 'assets/img/integrations/facebook-messenger-dark-icon.svg'
import instagramDirectMessageIcon from 'assets/img/integrations/Instagram-direct-message-blue.svg'

import {TicketMessage} from 'models/ticket/types'
import PrivateReplyButton from 'pages/common/components/PrivateReplyToFBComment/PrivateReplyButton'

import CollapsedAction from './CollapsedAction'

import css from './PrivateReplyAction.less'

export type PrivateReplyActionComponent = React.FC<{
    id?: string
    onClick?: React.MouseEventHandler
    disabled?: boolean
}>

const makePrivateReplyAction: (props: {
    isInstagramComment: boolean
}) => PrivateReplyActionComponent =
    ({isInstagramComment}) =>
    ({id, onClick, disabled}) =>
        (
            <CollapsedAction
                id={id}
                icon={
                    <img
                        className={
                            isInstagramComment
                                ? css.instagramDirectMessageIcon
                                : css.messengerIcon
                        }
                        src={
                            isInstagramComment
                                ? instagramDirectMessageIcon
                                : messengerIcon
                        }
                        alt="private message icon"
                    />
                }
                title={'Message'}
                description={`Respond with a ${
                    isInstagramComment ? 'direct' : ''
                } message`}
                onClick={onClick}
                disabled={disabled}
            />
        )

type PrivateReplyActionProps = {
    message: TicketMessage
    isInstagramComment: boolean
    isFacebookComment: boolean
    onClick: () => void
}

const PrivateReplyAction: React.FC<PrivateReplyActionProps> = ({
    message: {
        id: ticketMessageId,
        meta,
        created_datetime: messageCreatedDatetime,
    },
    isInstagramComment,
    isFacebookComment,
    onClick,
}) => (
    <PrivateReplyButton
        ticketMessageId={ticketMessageId!}
        meta={meta!}
        messageCreatedDatetime={messageCreatedDatetime}
        component={makePrivateReplyAction({isInstagramComment})}
        isFacebookComment={isFacebookComment}
        onClick={onClick}
    />
)

export default PrivateReplyAction
