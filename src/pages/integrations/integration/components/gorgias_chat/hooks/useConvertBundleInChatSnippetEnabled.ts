import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'

export function useConvertBundleInChatSnippetEnabled() {
    return useFlag(FeatureFlagKey.ConvertChatInstallSnippet)
}
