import {AccountFeatureMetadata} from '../state/currentAccount/types'

export function isFeatureEnabled(
    featureMetadata: AccountFeatureMetadata
): boolean {
    return typeof featureMetadata === 'boolean'
        ? featureMetadata
        : featureMetadata.enabled
}
