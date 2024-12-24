import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

export function useShowAiAgentStandaloneMenu(): boolean {
    return !!useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]
}
