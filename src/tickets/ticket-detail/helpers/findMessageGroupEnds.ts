import type { TicketElement } from '../types'

export function findMessageGroupEnds(elements: TicketElement[]): number[] {
    const ends: number[] = []

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i]

        if (element.type === 'message') {
            let j = i + 1
            while (j < elements.length && elements[j].type === 'bare-message') {
                j++
            }

            ends.push(j - 1)
            i = j - 1
        }
    }

    return ends
}
