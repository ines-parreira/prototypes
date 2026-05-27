import { TagColor } from '@gorgias/axiom'

import type { ReferenceCardStatus } from '../shared/ReferenceCardShell'

export function getTicketStatusTag(
    status: string | undefined,
): ReferenceCardStatus | undefined {
    switch (status) {
        case 'open':
            return { label: 'Open', color: TagColor.Green }
        case 'closed':
            return { label: 'Closed', color: TagColor.Grey }
        default:
            return undefined
    }
}
