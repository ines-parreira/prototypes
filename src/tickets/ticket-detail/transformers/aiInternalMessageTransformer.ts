import { isAIAgentMessage } from '../helpers/isAIAgentMessage'
import type { TicketElement } from '../types'

export function aiInternalMessageTransformer(
    elements: TicketElement[],
): TicketElement[] {
    return elements.filter((element) => {
        if (element.type !== 'message' || !isAIAgentMessage(element.data)) {
            return true
        }

        if (!element.data.public) {
            return false
        }

        return true
    })
}
