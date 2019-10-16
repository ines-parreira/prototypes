// @flow
import classNames from 'classnames'
import type {List, Map} from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import {
    TEXT_OR_ATTACHMENT_SOURCE_TYPES,
} from '../../../../../config/ticket'
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
    newMessageType: string,
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

        const isAnswerable = ticket.getIn(['reply_options', newMessageType, 'answerable'])
        const notAnswerableReason = ticket.getIn(['reply_options', newMessageType, 'reason'])

        const cantWriteTextBecauseOfAttachments =
            TEXT_OR_ATTACHMENT_SOURCE_TYPES.includes(newMessageType)
            && newMessageAttachments.size >= 1

        let alertText = ''
        let isAlert = cantWriteTextBecauseOfAttachments || !isAnswerable

        if (cantWriteTextBecauseOfAttachments) {
            alertText = 'When using Facebook, you can either send a text message, or an attachment, ' +
                'but not both at the same time. If you want to write a message, remove the attachment first.'
        }

        if (!isAnswerable) {
            alertText = notAnswerableReason
        }

        const className = classNames(css.component, passedClassName, {
            [css.internal]: !isNewMessagePublic,
            'alert-warning': isAlert,
        })

        return (
            <div className={className}>
                {
                    isAlert ? (
                        <div className={css.alert}>
                            {alertText}
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
