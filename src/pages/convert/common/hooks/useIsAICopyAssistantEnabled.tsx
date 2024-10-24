import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

export const useIsAICopyAssistantEnabled = (): boolean => {
    const flags = useFlags()

    return !!flags[FeatureFlagKey.ConvertAiCopyAssistant]
}
