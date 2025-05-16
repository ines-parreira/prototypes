import { useMemo, useState } from 'react'

import { Link, useLocation } from 'react-router-dom'

import { Banner } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { getAiAgentBasePath } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getStoresEligibleForTrial } from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useStoreActivations } from '../../hooks/useStoreActivations'

const ShoppingAssistantTrialSystemBanner: React.FC = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const pathname = useLocation().pathname

    const { storeActivations } = useStoreActivations({
        pageName: pathname,
    })

    const isShoppingAssistantTrialSystemBannerEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantTrialSystemBanner,
        false,
    )

    const { canStartTrial, canStartTrialFromFeatureFlag } =
        useActivateAiAgentTrial({
            storeActivations,
            accountDomain,
            onSuccess: () => {},
        })

    const isAtLeastOneStoreHasActiveTrial = useAtLeastOneStoreHasActiveTrial()

    const storeEligibleForTrial = getStoresEligibleForTrial(storeActivations)

    const isTicketsPage =
        pathname.includes('tickets') || pathname.includes('views')

    const [hideBanner, setHideBanner] = useState(false)

    const displayBanner = useMemo(
        () =>
            isShoppingAssistantTrialSystemBannerEnabled &&
            !isAtLeastOneStoreHasActiveTrial &&
            !isTicketsPage &&
            !hideBanner &&
            storeEligibleForTrial.length &&
            (canStartTrial || canStartTrialFromFeatureFlag),
        [
            isShoppingAssistantTrialSystemBannerEnabled,
            isAtLeastOneStoreHasActiveTrial,
            isTicketsPage,
            hideBanner,
            storeEligibleForTrial,
            canStartTrial,
            canStartTrialFromFeatureFlag,
        ],
    )

    const basePath = getAiAgentBasePath(storeEligibleForTrial[0]?.name)

    const redirectionPath = `${basePath}/sales`

    return (
        <>
            {displayBanner && (
                <Banner
                    variant="inline"
                    icon
                    type="info"
                    fillStyle="fill"
                    onClose={() => {
                        setHideBanner(true)
                    }}
                >
                    AI Agent just got even smarter with brand new Shopping
                    Assistant skills,{' '}
                    <Link to={redirectionPath}>
                        start your exclusive access to a 14-day trial
                    </Link>
                </Banner>
            )}
        </>
    )
}

export default ShoppingAssistantTrialSystemBanner
