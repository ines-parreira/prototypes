import React, {Component, ReactNode} from 'react'
import classNamesBind from 'classnames/bind'
import {connect, ConnectedProps} from 'react-redux'

import * as infobarActions from '../../../../../state/infobar/actions'
import {Actor, Meta, Source} from '../../../../../models/ticket/types'
import PrivateReplyButton from '../../../../common/components/PrivateReplyToFBComment/PrivateReplyButton'
import * as billingSelectors from '../../../../../state/billing/selectors'
import {TicketMessageSourceType} from '../../../../../business/types/ticket'
import {RootState} from '../../../../../state/types'

import css from './SourceActions.less'

const classNames = classNamesBind.bind(css)

type Props = {
    source?: Source
    meta?: Meta
    integrationId: number | null
    messageId?: string
    fromAgent: boolean
    ticketMessageId: number
    senderId: number
    ticketId?: number
    bodyText?: string
    sender: Actor
    messageCreatedDatetime: string
} & ConnectedProps<typeof connector>

export class SourceActionsHeader extends Component<Props> {
    _executeAction = (actionName: string) => {
        const {integrationId, messageId, executeAction} = this.props
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
            source,
            meta,
            fromAgent,
            integrationId,
            messageId,
            ticketMessageId,
            senderId,
            ticketId,
            bodyText,
            sender,
            messageCreatedDatetime,
            accountHasLegacyPlan,
        } = this.props

        const widgets: ReactNode[] = []

        if (!source || !source.type || meta?.is_duplicated) {
            return widgets
        }

        const isInstagramComment = [
            TicketMessageSourceType.InstagramComment,
            TicketMessageSourceType.InstagramAdComment,
        ].includes(source.type)
        const isFacebookComment =
            source.type === TicketMessageSourceType.FacebookComment

        // If the comment is a Facebook comment, posted by the page, then the API will never allow us to hide it.
        // So we don't even display the `hide` button to avoid frustration.
        if ((isInstagramComment || isFacebookComment) && !fromAgent) {
            let hiddenDatetime = null

            if (meta && meta.hidden_datetime) {
                hiddenDatetime = meta.hidden_datetime
            }

            const shouldHide = !hiddenDatetime

            if (
                (isInstagramComment && !accountHasLegacyPlan) ||
                isFacebookComment
            ) {
                widgets.push(
                    <PrivateReplyButton
                        key="private_reply-action"
                        integrationId={integrationId!}
                        messageId={messageId!}
                        ticketMessageId={ticketMessageId}
                        senderId={senderId}
                        ticketId={ticketId!}
                        commentMessage={bodyText!}
                        source={source}
                        sender={sender}
                        meta={meta}
                        messageCreatedDatetime={messageCreatedDatetime}
                        isFacebookComment={isFacebookComment}
                        className={classNames(
                            'hidden-sm-down',
                            css.actionButton,
                            css.replyButton
                        )}
                    />
                )
            }

            widgets.push(
                <span
                    key="hide-action"
                    className={classNames(
                        'btn',
                        'btn-secondary',
                        'hidden-sm-down',
                        css.visibilityButton,
                        css.actionButton
                    )}
                    onClick={() =>
                        isInstagramComment
                            ? this._toggleInstagramHideComment(shouldHide)
                            : this._toggleFacebookHideComment(shouldHide)
                    }
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
            )
        }

        return widgets
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            accountHasLegacyPlan: billingSelectors.hasLegacyPlan(state),
        }
    },
    {
        executeAction: infobarActions.executeAction,
    }
)

export default connector(SourceActionsHeader)
