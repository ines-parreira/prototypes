// @flow
import classNames from 'classnames'
import type {List, Map} from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import { canReply, type TicketMessageSourceType } from '../../../../../business/ticket'
import * as newMessageActions from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getActionTemplate} from '../../../../../utils'

import TicketAttachments from './TicketAttachments'
import css from './TicketReply.less'
import TicketReplyAction from './TicketReplyAction'
import TicketReplyEditor from './TicketReplyEditor'

type Props = {
    actions: Object,
    deleteAttachment?: number => void,
    className?: string,
    ticket: Map<*,*>,
    newMessageType: TicketMessageSourceType,
    newMessageAttachments: List<*>,
    appliedMacro: ?Map<*,*>,
    isNewMessagePublic: boolean,
    richAreaRef: () => void
}

@connect((state) => {
    return {
        isNewMessagePublic: newMessageSelectors.isNewMessagePublic(state),
        newMessageType: newMessageSelectors.getNewMessageType(state),
        newMessageAttachments: newMessageSelectors.getNewMessageAttachments(state),
    }
}, {
    deleteAttachment: newMessageActions.deleteAttachment,
})
// $FlowFixMe
export default class TicketReply extends React.Component<Props> {
    _renderAttachments = () => {
        const {newMessageAttachments, deleteAttachment} = this.props

        return (
            <TicketAttachments
                removable
                attachments={newMessageAttachments}
                deleteAttachment={deleteAttachment}
                className="p-2"
            />
        )
    }

    _renderActions = () => {
        const {ticket, appliedMacro, actions} = this.props

        const backendActions = appliedMacro ?
            appliedMacro.get('actions').filter(
                (action) => getActionTemplate(action.get('name')).execution === 'back'
            ) : []

        if (!appliedMacro || !backendActions) {
            return null
        }

        return (
            <div>
                {
                    backendActions.map((action, key) => (
                        <TicketReplyAction
                            key={key}
                            index={appliedMacro.get('actions').indexOf(action)}
                            action={action}
                            update={actions.ticket.updateActionArgsOnApplied}
                            remove={actions.ticket.deleteActionOnApplied}
                            ticketId={ticket.get('id')}
                        />
                    ))
                }
            </div>
        )
    }

    render() {
        const {
            ticket,
            isNewMessagePublic,
            actions,
            richAreaRef,
            className: passedClassName,
            newMessageType,
            newMessageAttachments
        } = this.props

        const canReplyResult = canReply(
            newMessageType,
            newMessageAttachments.size,
            ticket.getIn(['reply_options', newMessageType, 'reason'])
        )

        const className = classNames(css.component, passedClassName, {
            [css.internal]: !isNewMessagePublic,
            'alert-warning': !!canReplyResult,
        })

        return (
            <div className={className}>
                {
                    !!canReplyResult ? (
                        <div className={css.alert}>
                            {canReplyResult.message}
                        </div>
                    ) : (
                        <TicketReplyEditor
                            actions={actions}
                            ticket={ticket}
                            richAreaRef={richAreaRef}
                        />
                    )
                }
                {this._renderAttachments()}
                {this._renderActions()}
            </div>
        )
    }
}
