import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

export function useConvertBundleInChatSnippetEnabled() {
    return useFlag(FeatureFlagKey.ConvertChatInstallSnippet)
}
