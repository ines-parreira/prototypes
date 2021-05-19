import {Account, AccountFeatureMetadata} from '../state/currentAccount/types'
import {Plan} from '../models/billing/types'

export function isFeatureEnabled(
    featureMetadata: AccountFeatureMetadata
): boolean {
    return typeof featureMetadata === 'boolean'
        ? featureMetadata
        : featureMetadata.enabled
}

export const hasLegacyPlan = (
    account: Account,
    plan: Plan | Record<string, unknown>
): boolean => {
    return (
        !!account.meta?.has_legacy_features ||
        (Object.keys(plan).length > 0 && !plan.public && !plan.custom)
    )
}
