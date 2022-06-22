import React, {useState, useCallback, useContext} from 'react'
import {Dropdown, DropdownMenu, DropdownToggle} from 'reactstrap'
import classnames from 'classnames'

import IntentsFeedback from 'pages/tickets/detail/components/TicketMessages/IntentsFeedback/IntentsFeedback'
import PrivateReplyModal from 'pages/common/components/PrivateReplyToFBComment/PrivateReplyModal/PrivateReplyModal'

import type {TicketMessage} from 'models/ticket/types'

import {SourceDetailsContext} from '../SourceDetailsHeader'

import HideAction from './CollapsedActions/HideAction'
import IntentsAction from './CollapsedActions/IntentsAction'
import PrivateReplyAction from './CollapsedActions/PrivateReplyAction'

import css from './CollapsedSourceActions.less'

type CollapsedActionsProps = CollapsedSourceActionsProps & {
    togglePrivateReplyModal: () => void
    toggleIntents: () => void
}

const CollapsedActions: React.FC<CollapsedActionsProps> = ({
    message,
    showHideAction,
    showPrivateReplyAction,
    togglePrivateReplyModal,
    shouldHide,
    isFacebookComment,
    toggleHideComment,
    toggleIntents,
    collapseIntents,
}) => (
    <div className={css.actions}>
        {showHideAction && (
            <>
                <HideAction
                    shouldHide={shouldHide}
                    isFacebookComment={isFacebookComment}
                    toggleHideComment={toggleHideComment}
                />
                {showPrivateReplyAction && (
                    <PrivateReplyAction
                        message={message}
                        isFacebookComment={isFacebookComment}
                        onClick={togglePrivateReplyModal}
                    />
                )}
            </>
        )}
        {collapseIntents && <IntentsAction onClick={toggleIntents} />}
    </div>
)

type CollapsedSourceActionsProps = {
    message: TicketMessage
    showPrivateReplyAction: boolean
    showHideAction: boolean
    showIntentsAction?: boolean
    shouldHide: boolean
    isFacebookComment: boolean
    collapseIntents?: boolean

    toggleHideComment: () => void
}

const CollapsedSourceActions: React.FC<CollapsedSourceActionsProps> = ({
    message,
    showPrivateReplyAction,
    showHideAction,
    showIntentsAction,
    shouldHide,
    isFacebookComment,
    toggleHideComment,
    collapseIntents,
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

    const {setFocus} = useContext(SourceDetailsContext)

    const [isOpen, setOpen] = useState(false)

    const [showReplyModal, setShowReplyModal] = useState(false)
    const toggleShowReplyModal = () => setShowReplyModal(!showReplyModal)

    const [showIntents, setShowIntents] = useState(false)
    const hideIntents = useCallback(() => setShowIntents(false), [])

    const close = useCallback(() => {
        setFocus(false)
        setOpen(false)
    }, [setFocus])

    const onContentMouseLeave = useCallback(() => {
        close()
        hideIntents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (
        !showHideAction &&
        !showPrivateReplyAction &&
        (!showIntentsAction || !collapseIntents)
    )
        return null

    const onlyIntents =
        !showHideAction && !showPrivateReplyAction && showIntentsAction

    const showIntentsInMenu = showIntents || onlyIntents

    return (
        <>
            <Dropdown
                key={String(showIntents)}
                isOpen={isOpen}
                toggle={() => {
                    setFocus(true)
                    setOpen(!isOpen)
                }}
                onMouseLeave={close}
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
                        {showIntentsInMenu ? (
                            <IntentsFeedback
                                message={message}
                                renderContentOnly
                                onContentMouseLeave={onContentMouseLeave}
                                onToggle={hideIntents}
                                onBack={onlyIntents ? undefined : hideIntents}
                            />
                        ) : (
                            <CollapsedActions
                                message={message}
                                showPrivateReplyAction={showPrivateReplyAction}
                                togglePrivateReplyModal={toggleShowReplyModal}
                                showHideAction={showHideAction}
                                shouldHide={shouldHide}
                                isFacebookComment={isFacebookComment}
                                toggleHideComment={toggleHideComment}
                                toggleIntents={() =>
                                    setShowIntents(!showIntents)
                                }
                                collapseIntents={collapseIntents}
                            />
                        )}
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
