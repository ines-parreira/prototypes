import type { TicketMessage } from '@gorgias/api-types'

import { TicketVia } from 'business/types/ticket'
import { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import { findMessageGroupEnds } from '../helpers/findMessageGroupEnds'
import { hasCloseAction } from '../helpers/hasCloseAction'
import { hasHandoverAction } from '../helpers/hasHandoverAction'
import { hasSnoozeAction } from '../helpers/hasSnoozeAction'
import { isAIAgentMessage } from '../helpers/isAIAgentMessage'
import type { TicketElement } from '../types'

export function aiMessageEventsTransformer(
    elements: TicketElement[],
): TicketElement[] {
    const messageActionsArray = findMessageGroupEnds(elements)
        // first map all entries to the actual message data
        .map((index) => {
            const e = elements[index]
            const msg =
                e.type === 'message'
                    ? e.data
                    : e.type === 'bare-message'
                      ? e.data.message
                      : null
            return [index, msg] as const
        })
        // filter out any messages we already know we don't care about
        .filter(
            (entry): entry is [number, TicketMessage] =>
                entry[1]?.via === TicketVia.Api && isAIAgentMessage(entry[1]),
        )
        // for each entry, determine what kind of action was executed
        .map<[number, TicketEventEnum | null]>(([index, msg]) =>
            hasCloseAction(msg)
                ? [index, TicketEventEnum.CLOSE]
                : hasSnoozeAction(msg)
                  ? [index, TicketEventEnum.SNOOZE]
                  : hasHandoverAction(msg)
                    ? [index, TicketEventEnum.HANDOVER]
                    : [index, null],
        )
        // filter out any entry that did not generate an event
        .filter((entry): entry is [number, TicketEventEnum] => !!entry[1])

    // and convert that into a lookup map for element index -> action
    const messageActions = Object.fromEntries(messageActionsArray)

    return elements.flatMap((element, index) => {
        const eventType = messageActions[index]
        if (!eventType) {
            return element
        }

        return [
            element,
            {
                type: 'ai-event',
                data: { eventType },
                datetime: element.datetime,
            },
        ]
    })
}
