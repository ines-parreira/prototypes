import React from 'react'

import cn from 'classnames'

import { TicketMessageSourceType } from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useDebouncedValue from 'hooks/useDebouncedValue'
import useElementSize from 'hooks/useElementSize'
import { isTicketMessageDeleted } from 'models/ticket/predicates'
import type { TicketMessage } from 'models/ticket/types'
import PrivateReply from 'pages/common/components/PrivateReplyToFBComment/PrivateReply'
import { getIsCurrentHelpdeskLegacy } from 'state/billing/selectors'
import * as infobarActions from 'state/infobar/actions'

import CollapsedSourceActions from './CollapsedSourceActions/CollapsedSourceActions'
import IntentsFeedback from './IntentsFeedback/IntentsFeedback'

import css from './SourceActionsHeader.less'

type Props = {
    message: TicketMessage
    containerRef?: React.RefObject<HTMLElement>
}

export default function SourceActionsHeader({ message, containerRef }: Props) {
    const dispatch = useAppDispatch()

    const isCurrentHelpdeskLegacy = useAppSelector(getIsCurrentHelpdeskLegacy)
    const executeAction = (actionName: string) => {
        if (integrationId) {
            dispatch(
                infobarActions.executeAction({
                    actionName,
                    integrationId,
                    payload: {
                        comment_id: messageId,
                    },
                }),
            )
        }
    }

    const toggleInstagramHideComment = (hide: boolean) => {
        executeAction(hide ? 'instagramHideComment' : 'instagramUnhideComment')
    }

    const toggleFacebookHideComment = (hide: boolean) => {
        executeAction(hide ? 'facebookHideComment' : 'facebookUnhideComment')
    }
    const {
        source,
        meta,
        integration_id: integrationId,
        message_id: messageId,
        from_agent: fromAgent,
        sender: { id: senderId },
        id: ticketMessageId,
        ticket_id: ticketId,
        body_text: bodyText,
        sender,
        created_datetime: messageCreatedDatetime,
    } = message

    const [width] = useElementSize(containerRef?.current || null)
    const debouncedWidth = useDebouncedValue(width, 300)
    const collapseActions = Boolean(width) && debouncedWidth < 400
    const collapseIntents = Boolean(width) && debouncedWidth < 300

    if (
        !source ||
        !source.type ||
        meta?.is_duplicated ||
        isTicketMessageDeleted(message)
    ) {
        return null
    }

    const isInstagramComment = [
        TicketMessageSourceType.InstagramComment,
        TicketMessageSourceType.InstagramAdComment,
    ].includes(source.type)
    const isFacebookComment =
        source.type === TicketMessageSourceType.FacebookComment

    const showHideAction =
        (isInstagramComment || isFacebookComment) && !fromAgent

    const showPrivateReplyAction =
        (isInstagramComment && !isCurrentHelpdeskLegacy) || isFacebookComment

    let hiddenDatetime = null

    if (meta && meta.hidden_datetime) {
        hiddenDatetime = meta.hidden_datetime
    }

    const shouldHide = !hiddenDatetime

    const toggleHideComment = () =>
        isInstagramComment
            ? toggleInstagramHideComment(shouldHide)
            : toggleFacebookHideComment(shouldHide)

    return (
        <div className={css.widgets}>
            {!fromAgent && !collapseIntents && (
                <IntentsFeedback message={message} />
            )}
            {collapseActions ? (
                <CollapsedSourceActions
                    key="collapsed-source-actions"
                    message={message}
                    showPrivateReplyAction={showPrivateReplyAction}
                    showHideAction={showHideAction}
                    showIntentsAction={!fromAgent}
                    shouldHide={shouldHide}
                    isFacebookComment={isFacebookComment}
                    toggleHideComment={toggleHideComment}
                    collapseIntents={collapseIntents}
                />
            ) : showHideAction ? (
                <>
                    {showPrivateReplyAction && (
                        <PrivateReply
                            key="private_reply-action"
                            integrationId={integrationId!}
                            messageId={messageId!}
                            ticketMessageId={ticketMessageId!}
                            senderId={senderId}
                            ticketId={ticketId!}
                            commentMessage={bodyText!}
                            source={source}
                            sender={sender}
                            meta={meta!}
                            messageCreatedDatetime={messageCreatedDatetime}
                            isFacebookComment={isFacebookComment}
                            className={cn(
                                'hidden-sm-down',
                                css.actionButton,
                                css.replyButton,
                            )}
                        />
                    )}
                    <span
                        key="hide-action"
                        className={cn(
                            'btn',
                            'btn-secondary',
                            'hidden-sm-down',
                            css.visibilityButton,
                            css.actionButton,
                        )}
                        onClick={toggleHideComment}
                    >
                        {shouldHide ? (
                            <i className="material-icons md-36" title="Hide">
                                visibility_off
                            </i>
                        ) : (
                            <i className="material-icons md-36" title="Unhide">
                                visibility
                            </i>
                        )}
                    </span>
                </>
            ) : null}
        </div>
    )
}
