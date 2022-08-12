import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classNames from 'classnames'
import {List, Map} from 'immutable'

import {RootState} from 'state/types'
import {canReply} from 'business/ticket'

import {deleteActionOnApplied} from '../../../../../state/ticket/actions'
import {deleteAttachment} from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import DEPRECATED_RichField from '../../../../common/forms/RichField/DEPRECATED_RichField'

import TicketAttachments from './TicketAttachments'
import css from './TicketReply.less'
import TicketReplyEditor from './TicketReplyEditor'
import TicketReplyActions from './TicketReplyActions'

type Props = {
    appliedMacro?: Map<any, any>
    applyMacro: (macro: Map<any, any>) => void
    className?: string
    macros: List<any>
    richAreaRef: (ref: DEPRECATED_RichField | null) => void
    shouldDisplayQuickReply: boolean
    ticket: Map<any, any>
} & ConnectedProps<typeof connector>

export class TicketReplyContainer extends Component<Props> {
    renderAttachments = () => {
        const {newMessageAttachments, deleteAttachment} = this.props

        return (
            <TicketAttachments
                removable
                attachments={newMessageAttachments}
                deleteAttachment={deleteAttachment}
                className="p-2 d-flex flex-wrap"
            />
        )
    }

    render() {
        const {
            ticket,
            appliedMacro,
            isNewMessagePublic,
            richAreaRef,
            className: passedClassName,
            newMessageType,
            newMessageAttachments,
            macros,
            applyMacro,
            shouldDisplayQuickReply,
            deleteActionOnApplied,
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
                {!!canReplyResult ? (
                    <div className={css.alert}>{canReplyResult.message}</div>
                ) : (
                    <TicketReplyEditor
                        ticket={ticket}
                        richAreaRef={richAreaRef}
                        macros={macros}
                        applyMacro={applyMacro}
                        shouldDisplayQuickReply={shouldDisplayQuickReply}
                    />
                )}
                {this.renderAttachments()}
                {appliedMacro ? (
                    <TicketReplyActions
                        ticketId={ticket.get('id')}
                        appliedMacro={appliedMacro}
                        onDelete={deleteActionOnApplied}
                    />
                ) : null}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            isNewMessagePublic: newMessageSelectors.isNewMessagePublic(state),
            newMessageAttachments:
                newMessageSelectors.getNewMessageAttachments(state),
            newMessageType: newMessageSelectors.getNewMessageType(state),
        }
    },
    {
        deleteActionOnApplied,
        deleteAttachment,
    }
)

export default connector(TicketReplyContainer)
