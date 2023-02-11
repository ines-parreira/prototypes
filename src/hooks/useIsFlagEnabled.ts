import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from '../config/featureFlags'

export function useIsFlagEnabled(key: FeatureFlagKey): boolean {
    const flags = useFlags()
    return Boolean(flags[key])
}
