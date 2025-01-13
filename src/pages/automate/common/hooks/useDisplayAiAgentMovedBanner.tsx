import {useFlags} from 'launchdarkly-react-client-sdk'

import {useLocation} from 'react-router-dom'

import {
    AlertBannerTypes,
    BannerCategories,
    ContextBanner,
    useBanners,
} from 'AlertBanners'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

const banner: ContextBanner = {
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
    const banners = useBanners()
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!isAiAgentStandaloneMenuEnabled) return
    if (!hasAutomate) return

    if (location.pathname.startsWith(AUTOMATE_APP_PREFIX_PATH)) {
        banners.addBanner(banner)
    } else {
        banners.removeBanner(banner.category, banner.instanceId)
    }
}
