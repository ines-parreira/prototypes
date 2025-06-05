import {
    useEmailDisconnectedBanner,
    useEmailDomainVerificationBanner,
    useEmailMigrationBanner,
    useScriptTagMigrationBanner,
    useZendeskImportFailedBanner,
} from './banners'
import { useAccountNotVerifiedBanner } from './useAccountNotVerifiedBanner'
import { useAiShoppingAssistantTrialBanner } from './useAiShoppingAssistantTrialBanner'
import { useStatusPageManager } from './useStatusPageManager'
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
    useAiShoppingAssistantTrialBanner()
}
