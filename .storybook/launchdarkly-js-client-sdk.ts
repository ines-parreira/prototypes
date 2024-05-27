/* eslint-disable */
import {FeatureFlagKey} from '../src/config/featureFlags'

let _flags =  (Object.keys(FeatureFlagKey).reduce((acc, key) => {
    acc[key] = false
    return acc
}, {}))
export const useFlags = () => _flags

export function decorator(story, {parameters}) {
    if (parameters && parameters.flags) {
        _flags = parameters.flags
    }
    return story()
}
