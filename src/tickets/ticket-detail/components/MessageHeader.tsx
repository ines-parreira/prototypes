import type { TicketMessage } from '@gorgias/helpdesk-types'

import useId from 'hooks/useId'
import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from 'models/ticket/predicates'
import Header from 'pages/tickets/detail/components/TicketMessages/Header'

type Props = {
    isAI?: boolean
    isFailed?: boolean
    message: TicketMessage
    messageMetadata: React.ReactNode
    containerRef?: React.RefObject<HTMLDivElement>
}

export function MessageHeader({
    isAI = false,
    message,
    isFailed,
    containerRef,
    messageMetadata,
}: Props) {
    const id = useId()
    return (
        <Header
            id={`message-${id}`}
            message={message}
            hasError={isFailed}
            isMessageDeleted={isTicketMessageDeleted(message)}
            isMessageHidden={isTicketMessageHidden(message)}
            isMessageFromAIAgent={isAI}
            sourceDetails={messageMetadata}
            containerRef={containerRef}
        />
    )
}
