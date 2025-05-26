import { isFailed } from 'models/ticket/predicates'
import { TicketMessage } from 'models/ticket/types'

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
            .map((element) => {
                if (element.type !== 'message') return element

                return {
                    ...element,
                    flags: [
                        ...(element.flags || []),
                        ...(isFailed(element.data as TicketMessage)
                            ? ['failed']
                            : []),
                    ],
                }
            })
    )
}
