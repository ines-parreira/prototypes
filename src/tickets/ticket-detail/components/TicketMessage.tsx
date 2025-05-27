import { TicketMessageElement } from '../types'
import { MessageBody } from './MessageBody'
import { MessageContent } from './MessageContent'

type Props = {
    element: TicketMessageElement
}

export function TicketMessage({ element }: Props) {
    const isAI = element.flags?.includes('ai') ?? false
    const isFailed = element.flags?.includes('failed') ?? false
    return (
        <MessageBody message={element.data} isAI={isAI}>
            <MessageContent message={element.data} isFailed={isFailed} />
        </MessageBody>
    )
}
