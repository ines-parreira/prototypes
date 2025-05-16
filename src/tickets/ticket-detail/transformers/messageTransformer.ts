import type { TicketElement } from '../types'

export function messageTransformer(elements: TicketElement[]): TicketElement[] {
    return elements.filter(
        (e) =>
            e.type !== 'message' ||
            !(e.data.meta as Record<string, unknown> | undefined)?.hidden,
    )
}
