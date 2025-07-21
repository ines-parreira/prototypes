import { isAIAgentMessage } from '../helpers/isAIAgentMessage'
import type { TicketElement } from '../types'

export function aiMessageTransformer(
    elements: TicketElement[],
): TicketElement[] {
    return elements.map((element) => {
        if (element.type !== 'message' || !isAIAgentMessage(element.data)) {
            return element
        }

        return {
            ...element,
            flags: [...(element.flags || []), 'ai'],
        }
    })
}
