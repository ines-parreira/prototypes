import type { TicketMessage } from '@gorgias/helpdesk-types'

import useId from 'hooks/useId'
import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from 'models/ticket/predicates'
import type { TicketMessage as TicketMessage_DEPRECATED } from 'models/ticket/types'
import Header from 'pages/tickets/detail/components/TicketMessages/Header'

import { MessageMetadata } from './MessageMetadata'

type Props = {
    isAI?: boolean
    isFailed?: boolean
    message: TicketMessage
    containerRef?: React.RefObject<HTMLDivElement>
}

export function MessageHeader({
    isAI = false,
    message,
    isFailed,
    containerRef,
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
            sourceDetails={<MessageMetadata message={message} />}
            containerRef={containerRef}
        />
    )
}
