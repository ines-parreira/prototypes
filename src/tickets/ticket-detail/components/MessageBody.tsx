import { ReactNode } from 'react'

import { TicketMessage } from '@gorgias/helpdesk-types'

import { MessageAttachments } from 'tickets/ticket-detail/components/MessageAttachments'

import MessageActions from './MessageActions'

type MessageBodyProps = {
    message: TicketMessage
    children: ReactNode
    isAI: boolean
}

export function MessageBody({ children, message, isAI }: MessageBodyProps) {
    return (
        <div>
            {children}
            <MessageAttachments message={message} />
            {!isAI && <MessageActions message={message} />}
        </div>
    )
}
