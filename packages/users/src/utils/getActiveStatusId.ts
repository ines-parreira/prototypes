import type { UserAvailability } from '@gorgias/helpdesk-queries'

/**
 * Resolves the active status id from a user's availability record: custom
 * statuses are identified by `custom_user_availability_status_id`, while
 * system statuses ('available' / 'unavailable') use `user_status` directly.
 */
export function getActiveStatusId(
    availability: UserAvailability | undefined,
): string | undefined {
    if (!availability) {
        return undefined
    }

    return (
        (availability.user_status === 'custom'
            ? availability.custom_user_availability_status_id
            : availability.user_status) ?? undefined
    )
}
