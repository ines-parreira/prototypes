import { TicketChannel } from 'business/types/ticket'

import { isSignalMessage } from '../helpers/isSignalMessage'
import type { TicketElement } from '../types'

type TicketMessageElement = Extract<TicketElement, { type: 'message' }>

const groupingChannels: Partial<Record<TicketChannel, true>> = {
    [TicketChannel.Chat]: true,
    [TicketChannel.FacebookMessenger]: true,
}

const groupingDuration = 1000 * 60 * 5

export function bareMessageTransformer(elements: TicketElement[]) {
    let firstOfGroup: TicketMessageElement | null = null

    return elements.map<TicketElement>((element) => {
        if (
            element.type !== 'message' ||
            isSignalMessage(element.data) ||
            !groupingChannels[element.data.channel as TicketChannel]
        ) {
            firstOfGroup = null
            return element
        }

        if (!firstOfGroup) {
            firstOfGroup = element
            return element
        }

        const msg1 = firstOfGroup
        const msg2 = element
        const msg1Timestamp = new Date(msg1.data.created_datetime).getTime()
        const msg2Timestamp = new Date(msg2.data.created_datetime).getTime()

        if (
            msg1.data.sender.id !== msg2.data.sender.id ||
            msg1.data.channel !== msg2.data.channel ||
            msg1.data.public !== msg2.data.public ||
            msg1.data.from_agent !== msg2.data.from_agent ||
            msg2Timestamp - msg1Timestamp > groupingDuration
        ) {
            firstOfGroup = element
            return element
        }

        return {
            ...element,
            type: 'bare-message',
            data: { isBare: true, message: element.data },
        }
    })
}
