import { useFlags } from 'launchdarkly-react-client-sdk'
import { useLocation } from 'react-router-dom'

import { AlertBannerTypes, BannerCategories, ContextBanner } from 'AlertBanners'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { getHasAutomate } from 'state/billing/selectors'

export const banner: ContextBanner = {
    category: BannerCategories.TMP_AI_AGENT_MOVED,
    type: AlertBannerTypes.Info,
    instanceId: AlertBannerTypes.Info,
    message:
        'AI Agent Settings have moved! You can now access them directly from the main menu.',
    CTA: {
        type: 'internal',
        text: 'Click here to explore.',
        to: '/app/ai-agent',
    },
}

const AUTOMATE_APP_PREFIX_PATH = '/app/automation'

export const useDisplayAiAgentMovedBanner = () => {
    const isAiAgentStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]
    const location = useLocation()
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!isAiAgentStandaloneMenuEnabled) return false
    if (!hasAutomate) return false

    if (location.pathname.startsWith(AUTOMATE_APP_PREFIX_PATH)) {
        return true
    }

    return false
}
