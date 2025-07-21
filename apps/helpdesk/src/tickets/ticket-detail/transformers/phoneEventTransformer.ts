import { isPhoneEvent } from '../helpers/isPhoneEvent'
import type { TicketElement } from '../types'

export function phoneEventTransformer(
    elements: TicketElement[],
): TicketElement[] {
    return elements.map((element) =>
        element.type !== 'event' || !isPhoneEvent(element.data)
            ? element
            : { ...element, type: 'phone-event' },
    )
}
