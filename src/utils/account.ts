import {Map} from 'immutable'

export function isFeatureEnabled(
    featureMetadata: boolean | Map<any, any>
): boolean {
    return typeof featureMetadata === 'boolean'
        ? featureMetadata
        : (featureMetadata.get('enabled') as boolean)
}
