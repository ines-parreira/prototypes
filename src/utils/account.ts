import {AccountFeatureMetadata} from '../state/currentAccount/types'

export function isFeatureEnabled(
    featureMetadata: AccountFeatureMetadata
): boolean {
    return featureMetadata.enabled
}
