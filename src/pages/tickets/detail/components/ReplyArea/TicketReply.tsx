import React, {ReactNode, useCallback} from 'react'
import classNames from 'classnames'
import {List, Map} from 'immutable'

import {canReply} from 'business/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {useSendersForSelectedChannel} from 'hooks/useOutboundChannels'
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
}

export function TicketReply({
    appliedMacro,
    applyMacro,
    className: passedClassName,
    macros,
    replyAreaHeader,
    richAreaRef,
    shouldDisplayQuickReply,
    ticket,
}: Props) {
    const dispatch = useAppDispatch()
    const newMessageAttachments = useAppSelector(getNewMessageAttachments)
    const newMessageType = useAppSelector(getNewMessageType)
    const {selectedSender} = useSendersForSelectedChannel()
    const canReplyResult = canReply(
        selectedSender,
        newMessageType,
        newMessageAttachments.size,
        ticket.getIn(['reply_options', newMessageType, 'reason'])
    )

    const className = classNames(css.component, passedClassName, {
        'alert-warning': !!canReplyResult,
    })

    const handleDeletion = useCallback(
        (number) => dispatch(deleteAttachment(number)),
        [dispatch]
    )

    const handleActionDeletion = useCallback(
        (actionIndex, ticketId) =>
            dispatch(deleteActionOnApplied(actionIndex, ticketId)),
        [dispatch]
    )

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
                context="ticket-reply"
                removable
                attachments={newMessageAttachments}
                deleteAttachment={handleDeletion}
                className="p-2 d-flex flex-wrap"
            />
            {appliedMacro ? (
                <TicketReplyActions
                    ticketId={ticket.get('id')}
                    appliedMacro={appliedMacro}
                    onDelete={handleActionDeletion}
                />
            ) : null}
        </div>
    )
}

export default TicketReply
