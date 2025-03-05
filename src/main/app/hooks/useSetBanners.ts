import {
    useEmailDisconnectedBanner,
    useEmailDomainVerificationBanner,
    useEmailMigrationBanner,
    useScriptTagMigrationBanner,
} from './banners'
import { useAccountNotVerifiedBanner } from './useAccountNotVerifiedBanner'
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
}
