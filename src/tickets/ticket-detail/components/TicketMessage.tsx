import { isErrorFlag } from '../helpers/isErrorFlag'
import { TicketMessageElement } from '../types'
import { MessageBody } from './MessageBody'
import { MessageContent } from './MessageContent'
import { MessageError } from './MessageError'

type Props = {
    element: TicketMessageElement
}

export function TicketMessage({ element }: Props) {
    const isAI = element.flags?.includes('ai') ?? false
    const error = element.flags?.find(isErrorFlag)?.[1]
    return (
        <MessageBody message={element.data} isAI={isAI}>
            <MessageContent message={element.data} isFailed={Boolean(error)} />
            {error && <MessageError error={error} />}
        </MessageBody>
    )
}
