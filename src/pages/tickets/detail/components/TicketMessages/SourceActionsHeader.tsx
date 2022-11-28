import React, {Component} from 'react'
import classNamesBind from 'classnames/bind'
import {connect, ConnectedProps} from 'react-redux'

import PrivateReply from 'pages/common/components/PrivateReplyToFBComment/PrivateReply'

import * as infobarActions from 'state/infobar/actions'
import {getIsCurrentHelpdeskLegacy} from 'state/billing/selectors'
import {TicketMessageSourceType} from 'business/types/ticket'
import {RootState} from 'state/types'
import type {TicketMessage} from 'models/ticket/types'

import CollapsedSourceActions from './CollapsedSourceActions/CollapsedSourceActions'

import IntentsFeedback from './IntentsFeedback/IntentsFeedback'

import css from './SourceActionsHeader.less'

const classNames = classNamesBind.bind(css)

type Props = {
    message: TicketMessage
    collapseActions?: boolean
    collapseIntents?: boolean
} & ConnectedProps<typeof connector>

export class SourceActionsHeader extends Component<Props> {
    _executeAction = (actionName: string) => {
        const {
            message: {integration_id: integrationId, message_id: messageId},
            executeAction,
        } = this.props
        if (integrationId) {
            executeAction({
                actionName,
                integrationId,
                payload: {
                    comment_id: messageId,
                },
            })
        }
    }

    _toggleInstagramHideComment = (hide: boolean) => {
        this._executeAction(
            hide ? 'instagramHideComment' : 'instagramUnhideComment'
        )
    }

    _toggleFacebookHideComment = (hide: boolean) => {
        this._executeAction(
            hide ? 'facebookHideComment' : 'facebookUnhideComment'
        )
    }

    render() {
        const {
            message: {
                source,
                meta,
                integration_id: integrationId,
                message_id: messageId,
                from_agent: fromAgent,
                sender: {id: senderId},
                id: ticketMessageId,
                ticket_id: ticketId,
                body_text: bodyText,
                sender,
                created_datetime: messageCreatedDatetime,
            },
            collapseActions,
            collapseIntents,
            isCurrentHelpdeskLegacy,
        } = this.props

        if (!source || !source.type || meta?.is_duplicated) {
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
            (isInstagramComment && !isCurrentHelpdeskLegacy) ||
            isFacebookComment

        let hiddenDatetime = null

        if (meta && meta.hidden_datetime) {
            hiddenDatetime = meta.hidden_datetime
        }

        const shouldHide = !hiddenDatetime

        const toggleHideComment = () =>
            isInstagramComment
                ? this._toggleInstagramHideComment(shouldHide)
                : this._toggleFacebookHideComment(shouldHide)

        const showIntents = !fromAgent

        return (
            <div className={css.widgets}>
                {showIntents && !collapseIntents && (
                    <IntentsFeedback message={this.props.message} />
                )}
                {collapseActions ? (
                    <CollapsedSourceActions
                        key="collapsed-source-actions"
                        message={this.props.message}
                        showPrivateReplyAction={showPrivateReplyAction}
                        showHideAction={showHideAction}
                        showIntentsAction={showIntents}
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
                                className={classNames(
                                    'hidden-sm-down',
                                    css.actionButton,
                                    css.replyButton
                                )}
                            />
                        )}
                        <span
                            key="hide-action"
                            className={classNames(
                                'btn',
                                'btn-secondary',
                                'hidden-sm-down',
                                css.visibilityButton,
                                css.actionButton
                            )}
                            onClick={toggleHideComment}
                        >
                            {shouldHide ? (
                                <i
                                    className="material-icons md-36"
                                    title="Hide"
                                >
                                    visibility_off
                                </i>
                            ) : (
                                <i
                                    className="material-icons md-36"
                                    title="Unhide"
                                >
                                    visibility
                                </i>
                            )}
                        </span>
                    </>
                ) : null}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            isCurrentHelpdeskLegacy: getIsCurrentHelpdeskLegacy(state),
        }
    },
    {
        executeAction: infobarActions.executeAction,
    }
)

export default connector(SourceActionsHeader)
