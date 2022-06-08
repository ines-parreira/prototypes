import React, {useState} from 'react'
import {Dropdown, DropdownMenu, DropdownToggle} from 'reactstrap'
import classnames from 'classnames'

import PrivateReplyModal from 'pages/common/components/PrivateReplyToFBComment/PrivateReplyModal/PrivateReplyModal'

import type {TicketMessage} from 'models/ticket/types'

import HideAction from './CollapsedActions/HideAction'
import PrivateReplyAction from './CollapsedActions/PrivateReplyAction'

import css from './CollapsedSourceActions.less'

type CollapsedActionsProps = CollapsedSourceActionsProps & {
    togglePrivateReplyModal: () => void
}

const CollapsedActions: React.FC<CollapsedActionsProps> = ({
    message,
    showHideAction,
    showPrivateReplyAction,
    togglePrivateReplyModal,
    shouldHide,
    isInstagramComment,
    isFacebookComment,
    toggleHideComment,
}) => (
    <div className={css.actions}>
        {showHideAction && (
            <HideAction
                shouldHide={shouldHide}
                isInstagramComment={isInstagramComment}
                toggleHideComment={toggleHideComment}
            />
        )}
        {showPrivateReplyAction && (
            <PrivateReplyAction
                message={message}
                isInstagramComment={isInstagramComment}
                isFacebookComment={isFacebookComment}
                onClick={togglePrivateReplyModal}
            />
        )}
    </div>
)

type CollapsedSourceActionsProps = {
    message: TicketMessage
    showPrivateReplyAction: boolean
    showHideAction: boolean
    shouldHide: boolean
    isInstagramComment: boolean
    isFacebookComment: boolean
    toggleHideComment: () => void
}

const CollapsedSourceActions: React.FC<CollapsedSourceActionsProps> = ({
    message,
    showPrivateReplyAction,
    showHideAction,
    shouldHide,
    isInstagramComment,
    isFacebookComment,
    toggleHideComment,
}) => {
    const {
        source,
        meta,
        integration_id: integrationId,
        message_id: messageId,
        sender: {id: senderId},
        id: ticketMessageId,
        ticket_id: ticketId,
        body_text: bodyText,
        sender,
        created_datetime: messageCreatedDatetime,
    } = message

    const [showReplyModal, setShowReplyModal] = useState(false)
    const toggleShowReplyModal = () => setShowReplyModal(!showReplyModal)

    const [isOpen, setOpen] = useState(false)

    if (!showHideAction && !showPrivateReplyAction) return null

    return (
        <>
            <Dropdown
                isOpen={isOpen}
                toggle={() => setOpen(!isOpen)}
                onMouseLeave={() => setOpen(false)}
                className={css.dropdown}
            >
                <DropdownToggle
                    className={classnames(
                        'btn',
                        'btn-secondary',
                        'hidden-sm-down',
                        css.dropdownToggle
                    )}
                >
                    <i className="material-icons" title="More">
                        more_vert
                    </i>
                </DropdownToggle>
                <DropdownMenu right className={css.menuWrapper}>
                    <div className={css.menu}>
                        <CollapsedActions
                            message={message}
                            showPrivateReplyAction={showPrivateReplyAction}
                            togglePrivateReplyModal={toggleShowReplyModal}
                            showHideAction={showHideAction}
                            shouldHide={shouldHide}
                            isInstagramComment={isInstagramComment}
                            isFacebookComment={isFacebookComment}
                            toggleHideComment={toggleHideComment}
                        />
                    </div>
                </DropdownMenu>
            </Dropdown>
            <PrivateReplyModal
                integrationId={integrationId!}
                messageId={messageId!}
                ticketMessageId={ticketMessageId!}
                senderId={senderId}
                ticketId={ticketId!}
                commentMessage={bodyText!}
                source={source!}
                sender={sender}
                meta={meta!}
                messageCreatedDatetime={messageCreatedDatetime}
                isFacebookComment={isFacebookComment}
                isOpen={showReplyModal}
                toggle={toggleShowReplyModal}
            />
        </>
    )
}

export default CollapsedSourceActions
