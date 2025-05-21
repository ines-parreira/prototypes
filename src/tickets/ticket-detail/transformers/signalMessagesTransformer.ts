import { isSignalMessage } from '../helpers/isSignalMessage'
import type { TicketElement } from '../types'

export function signalMessagesTransformer(
    elements: TicketElement[],
): TicketElement[] {
    return elements.filter(
        (element) =>
            element.type !== 'message' || !isSignalMessage(element.data),
    )
}
