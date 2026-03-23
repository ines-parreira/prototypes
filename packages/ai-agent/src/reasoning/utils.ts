const EVOLI_TICKET_TAG_NAMES = new Set(['ai_evolution', 'ai_next_gen'])

export function isEvoliTicket(
    tagNames?: Iterable<string | null | undefined>,
): boolean {
    if (!tagNames) {
        return false
    }

    for (const tagName of tagNames) {
        if (tagName && EVOLI_TICKET_TAG_NAMES.has(tagName)) {
            return true
        }
    }

    return false
}
