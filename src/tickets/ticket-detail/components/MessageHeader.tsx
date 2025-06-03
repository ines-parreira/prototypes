import type { TicketMessage } from '@gorgias/helpdesk-types'

import useId from 'hooks/useId'
import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from 'models/ticket/predicates'
import type { TicketMessage as TicketMessage_DEPRECATED } from 'models/ticket/types'
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
    const castMessage = message as TicketMessage_DEPRECATED
    return (
        <Header
            id={`message-${id}`}
            message={castMessage}
            hasError={isFailed}
            isMessageDeleted={isTicketMessageDeleted(castMessage)}
            isMessageHidden={isTicketMessageHidden(castMessage)}
            isMessageFromAIAgent={isAI}
            sourceDetails={messageMetadata}
            containerRef={containerRef}
        />
    )
}
