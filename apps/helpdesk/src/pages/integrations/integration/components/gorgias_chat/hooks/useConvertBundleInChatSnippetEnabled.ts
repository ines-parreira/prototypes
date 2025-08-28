import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'

export function useConvertBundleInChatSnippetEnabled() {
    return useFlag(FeatureFlagKey.ConvertChatInstallSnippet)
}
