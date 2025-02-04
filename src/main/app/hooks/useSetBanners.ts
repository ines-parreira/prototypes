import {useDisplayAiAgentMovedBanner} from 'pages/automate/common/hooks/useDisplayAiAgentMovedBanner'

import {useAccountNotVerifiedBanner} from './useAccountNotVerifiedBanner'
import {useImpersonatedBanner} from './useImpersonatedBanner'
import {useScriptTagMigrationBanner} from './useScriptTagMigrationBanner'
import {useStatusPageManager} from './useStatusPageManager'
import {useUsageBanner} from './useUsageBanner'

export function useSetBanners() {
    useAccountNotVerifiedBanner()
    useImpersonatedBanner()
    useStatusPageManager()
    useUsageBanner()
    useScriptTagMigrationBanner()

    // TMP: Remove this when the new AI Agent location will be adopted enough
    useDisplayAiAgentMovedBanner()
}
