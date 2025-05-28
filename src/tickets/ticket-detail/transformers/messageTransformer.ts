import type { TicketElement } from '../types'

export function messageTransformer(elements: TicketElement[]): TicketElement[] {
    return (
        elements
            // filter out hidden messages
            .filter(
                (element) =>
                    element.type !== 'message' ||
                    !(element.data.meta as Record<string, unknown> | undefined)
                        ?.hidden,
            )
    )
}
