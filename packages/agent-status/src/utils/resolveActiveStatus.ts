import type { UserAvailability } from '@gorgias/helpdesk-queries'

import type { AgentStatusWithSystem } from '../types'

/**
 * Resolves the active agent status based on user availability status and available statuses.
 */
export function resolveActiveStatus(
    status: UserAvailability | undefined,
    statuses: AgentStatusWithSystem[] | undefined,
): AgentStatusWithSystem | undefined {
    if (!status || !statuses) {
        return undefined
    }

    const currentStatusId =
        status.user_status === 'custom'
            ? status.custom_user_availability_status_id
            : status.user_status || null

    return statuses.find((statusItem) => statusItem.id === currentStatusId)
}
