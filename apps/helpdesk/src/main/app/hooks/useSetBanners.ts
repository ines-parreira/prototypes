import { useShoppingAssistantTrialBanner } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialBanner'

import {
    useAiAgentTrialBanner,
    useEmailDisconnectedBanner,
    useEmailDomainVerificationBanner,
    useEmailMigrationBanner,
    useScriptTagMigrationBanner,
    useZendeskImportFailedBanner,
} from './banners'
import { useAccountNotVerifiedBanner } from './useAccountNotVerifiedBanner'
import { useStatusPageManager } from './useStatusPageManager'
import { useTrackingBundleInstallationWarningBanner } from './useTrackingBundleInstallationWarningBanner'
import { useUsageBanner } from './useUsageBanner'

export function useSetBanners() {
    useAccountNotVerifiedBanner()
    useStatusPageManager()
    useUsageBanner()
    useScriptTagMigrationBanner()
    useEmailDomainVerificationBanner()
    useEmailDisconnectedBanner()
    useEmailMigrationBanner()
    useZendeskImportFailedBanner()
    useTrackingBundleInstallationWarningBanner()
    useShoppingAssistantTrialBanner()
    useAiAgentTrialBanner()
}
