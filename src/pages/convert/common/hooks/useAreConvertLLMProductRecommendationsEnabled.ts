import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

export const useAreConvertLLMProductRecommendationsEnabled = (): boolean => {
    const flags = useFlags()

    return !!flags[FeatureFlagKey.ConvertLLMProductRecommendations]
}
