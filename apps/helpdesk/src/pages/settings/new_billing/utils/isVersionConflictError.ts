import { isGorgiasApiError } from 'models/api/types'

export const SUBSCRIPTION_VERSION_CONFLICT_ERROR_MSG =
    'subscription has been modified since it was last retrieved'

export const SUBSCRIPTION_RENEWAL_RAMP_VERSION_INCONSISTENT_ERROR_MSG =
    'subscription scheduled changes at renewal has been updated'

export const SUBSCRIPTION_CHANGES_INCONSISTENT_WITH_RAMPS_ERROR_MSG =
    'subscription changes are inconsistent with existing scheduled changes'

export function isVersionConflictError(error: unknown): boolean {
    if (!isGorgiasApiError(error)) {
        return false
    }
    const msg = error.response.data.error.msg
    return (
        msg.includes(SUBSCRIPTION_VERSION_CONFLICT_ERROR_MSG) ||
        msg.includes(
            SUBSCRIPTION_RENEWAL_RAMP_VERSION_INCONSISTENT_ERROR_MSG,
        ) ||
        msg.includes(SUBSCRIPTION_CHANGES_INCONSISTENT_WITH_RAMPS_ERROR_MSG)
    )
}
