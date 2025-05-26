import { TicketMessageElement } from '../types'
import { MessageContent } from './MessageContent'

type Props = {
    element: TicketMessageElement
}

export function TicketMessage({ element }: Props) {
    return (
        <MessageContent
            message={element.data}
            isFailed={element.flags?.includes('failed') ?? false}
        />
    )
}
