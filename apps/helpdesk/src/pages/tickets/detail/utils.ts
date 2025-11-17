import type { TicketElement, TicketMessage } from 'models/ticket/types'
import { isVoiceCall } from 'models/voiceCall/types'

import type { ShoppingAssistantEvent } from './hooks/useInsertShoppingAssistantEventElements'

export const getVoiceCallIndex = (
    voiceCallId: string,
    elements: (
        | 'header'
        | TicketElement
        | TicketMessage[]
        | ShoppingAssistantEvent
    )[],
): number | 'LAST' => {
    const index = elements.findIndex((element) => {
        if (element === 'header') return false

        return (
            isVoiceCall(element) &&
            element.id.toString() === voiceCallId.toString()
        )
    })

    return index === -1 ? 'LAST' : index
}

export const isShoppingAssistantEvent = (
    element: TicketElement | TicketMessage | ShoppingAssistantEvent,
): element is ShoppingAssistantEvent => {
    return (
        'isShoppingAssistantEvent' in element &&
        element.isShoppingAssistantEvent
    )
}
