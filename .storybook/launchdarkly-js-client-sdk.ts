/* eslint-disable */
import {FeatureFlagKey} from '../src/config/featureFlags'

let _flags = {[FeatureFlagKey.NewDatePickerVariant]: false}
export const useFlags = () => _flags

export function decorator(story, {parameters}) {
    if (parameters && parameters.flags) {
        _flags = parameters.flags
    }
    return story()
}
