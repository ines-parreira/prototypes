import {useAccountNotVerifiedBanner} from './useAccountNotVerifiedBanner'
import {useImpersonatedBanner} from './useImpersonatedBanner'
import {useStatusPageManager} from './useStatusPageManager'
import {useUsageBanner} from './useUsageBanner'

export function useSetBanners() {
    useAccountNotVerifiedBanner()
    useImpersonatedBanner()
    useStatusPageManager()
    useUsageBanner()
}
