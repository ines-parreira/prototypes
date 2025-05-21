import { isPhoneEvent } from '../helpers/isPhoneEvent'
import type { TicketElement } from '../types'

export function eventTransformer(elements: TicketElement[]) {
    return elements.filter(
        (element) => element.type !== 'event' || isPhoneEvent(element.data),
    )
}
