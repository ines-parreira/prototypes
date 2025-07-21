import React, { ReactNode, useCallback } from 'react'

import classNames from 'classnames'
import { Map } from 'immutable'

import { Macro } from '@gorgias/helpdesk-queries'

import { canReply } from 'business/ticket'
import { UserRole } from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useSendersForSelectedChannel } from 'hooks/useOutboundChannels'
import RichField from 'pages/common/forms/RichField/RichField'
import { getCurrentUser } from 'state/currentUser/selectors'
import { deleteAttachment } from 'state/newMessage/actions'
import {
    getNewMessageAttachments,
    getNewMessageType,
} from 'state/newMessage/selectors'
import { deleteActionOnApplied } from 'state/ticket/actions'

import TicketAttachments from './TicketAttachments'
import TicketReplyActions from './TicketReplyActions'
import TicketReplyEditor from './TicketReplyEditor'

import css from './TicketReply.less'

type TicketReplyProps = {
    replyAreaHeader?: ReactNode
    appliedMacro?: Map<any, any>
    applyMacro: (macro: Macro) => void
    className?: string
    macros: Macro[]
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
}: TicketReplyProps) {
    const dispatch = useAppDispatch()
    const newMessageAttachments = useAppSelector(getNewMessageAttachments)
    const newMessageType = useAppSelector(getNewMessageType)
    const { selectedSender } = useSendersForSelectedChannel()
    const currentUser = useAppSelector(getCurrentUser)
    const canReplyResult = canReply(
        selectedSender,
        newMessageType,
        newMessageAttachments.size,
        currentUser.getIn(['role', 'name']) === UserRole.Admin,
        ticket.getIn(['reply_options', newMessageType]),
    )

    const className = classNames(css.component, passedClassName, {
        'alert-warning': !!canReplyResult,
    })

    const handleDeletion = useCallback(
        (number: number) => dispatch(deleteAttachment(number)),
        [dispatch],
    )

    const handleActionDeletion = useCallback(
        (actionIndex: number, ticketId: number) =>
            dispatch(deleteActionOnApplied(actionIndex, ticketId)),
        [dispatch],
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
            {appliedMacro && (
                <TicketReplyActions
                    ticketId={ticket.get('id')}
                    appliedMacro={appliedMacro}
                    onDelete={handleActionDeletion}
                />
            )}
        </div>
    )
}

export default TicketReply
