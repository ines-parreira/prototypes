import type {
    UpdateUserAvailabilityAsUser,
    UserAvailabilityStatus,
} from '@gorgias/helpdesk-queries'

/**
 * Builds the update data object for user availability status changes.
 */
export function buildUpdateData(
    statusId: UserAvailabilityStatus | string,
): UpdateUserAvailabilityAsUser {
    if (statusId === 'available' || statusId === 'unavailable') {
        return {
            user_status: statusId,
        }
    }

    return {
        user_status: 'custom',
        custom_user_availability_status_id: statusId,
    }
}
