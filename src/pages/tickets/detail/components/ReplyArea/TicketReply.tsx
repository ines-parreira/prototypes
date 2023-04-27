import React, {ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classNames from 'classnames'
import {List, Map} from 'immutable'

import {RootState} from 'state/types'
import {canReply} from 'business/ticket'

import RichField from 'pages/common/forms/RichField/RichField'
import {deleteAttachment} from 'state/newMessage/actions'
import {
    getNewMessageAttachments,
    getNewMessageType,
} from 'state/newMessage/selectors'
import {deleteActionOnApplied} from 'state/ticket/actions'

import TicketAttachments from './TicketAttachments'
import TicketReplyEditor from './TicketReplyEditor'
import TicketReplyActions from './TicketReplyActions'
import css from './TicketReply.less'

type Props = {
    replyAreaHeader?: ReactNode
    appliedMacro?: Map<any, any>
    applyMacro: (macro: Map<any, any>) => void
    className?: string
    macros: List<any>
    richAreaRef: (ref: RichField | null) => void
    shouldDisplayQuickReply: boolean
    ticket: Map<any, any>
} & ConnectedProps<typeof connector>

export function TicketReplyContainer({
    appliedMacro,
    applyMacro,
    className: passedClassName,
    deleteActionOnApplied,
    deleteAttachment,
    macros,
    newMessageAttachments,
    newMessageType,
    replyAreaHeader,
    richAreaRef,
    shouldDisplayQuickReply,
    ticket,
}: Props) {
    const canReplyResult = canReply(
        newMessageType,
        newMessageAttachments.size,
        ticket.getIn(['reply_options', newMessageType, 'reason'])
    )

    const className = classNames(css.component, passedClassName, {
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
                    replyAreaHeader={replyAreaHeader}
                />
            )}
            <TicketAttachments
                removable
                attachments={newMessageAttachments}
                deleteAttachment={deleteAttachment}
                className="p-2 d-flex flex-wrap"
            />
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

const connector = connect(
    (state: RootState) => {
        return {
            newMessageAttachments: getNewMessageAttachments(state),
            newMessageType: getNewMessageType(state),
        }
    },
    {
        deleteActionOnApplied,
        deleteAttachment,
    }
)

export default connector(TicketReplyContainer)
