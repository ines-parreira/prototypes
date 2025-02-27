import { TicketElement, TicketMessage } from 'models/ticket/types'
import { isVoiceCall } from 'models/voiceCall/types'

export const getVoiceCallIndex = (
    voiceCallId: string,
    elements: ('header' | TicketElement | TicketMessage[])[],
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
