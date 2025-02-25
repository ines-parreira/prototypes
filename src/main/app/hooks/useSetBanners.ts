import {
    useEmailDisconnectedBanner,
    useEmailDomainVerificationBanner,
    useEmailMigrationBanner,
    useScriptTagMigrationBanner,
} from './banners'
import { useAccountNotVerifiedBanner } from './useAccountNotVerifiedBanner'
import { useImpersonatedBanner } from './useImpersonatedBanner'
import { useStatusPageManager } from './useStatusPageManager'
import { useUsageBanner } from './useUsageBanner'

export function useSetBanners() {
    useAccountNotVerifiedBanner()
    useImpersonatedBanner()
    useStatusPageManager()
    useUsageBanner()
    useScriptTagMigrationBanner()
    useEmailDomainVerificationBanner()
    useEmailDisconnectedBanner()
    useEmailMigrationBanner()
}
