import { useCallback, useEffect, useMemo } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getAiAgentBasePath } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getStoresEligibleForTrial } from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'

export function useAiShoppingAssistantTrialBanner() {
    const { addBanner, removeBanner } = useBanners()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const pathname = useLocation().pathname

    const { storeActivations } = useStoreActivations({
        pageName: pathname,
    })
    const history = useHistory()

    const currentUser = useAppSelector(getCurrentUser)
    const userRole = useAppSelector(getRoleName)
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

    const displayBanner = useMemo(
        () =>
            isShoppingAssistantTrialSystemBannerEnabled &&
            !isAtLeastOneStoreHasActiveTrial &&
            !isTicketsPage &&
            storeEligibleForTrial.length &&
            (canStartTrial || canStartTrialFromFeatureFlag),
        [
            isShoppingAssistantTrialSystemBannerEnabled,
            isAtLeastOneStoreHasActiveTrial,
            isTicketsPage,
            storeEligibleForTrial,
            canStartTrial,
            canStartTrialFromFeatureFlag,
        ],
    )
    const basePath = getAiAgentBasePath(storeEligibleForTrial[0]?.name)
    const redirectionPath = `${basePath}/sales`

    const eventData = useMemo(
        () => ({
            accountId: currentAccount.get('id'),
            userId: currentUser.get('id'),
            userRole: userRole || '',
            type: 'system-banner',
        }),
        [currentAccount, currentUser, userRole],
    )
    const onClick = useCallback(() => {
        history.push(redirectionPath)
        logEvent(
            SegmentEvent.AiAgentShoppingAssistantTrialSystemBannerClicked,
            {
                ...eventData,
            },
        )
    }, [history, redirectionPath, eventData])

    useEffect(() => {
        if (displayBanner) {
            logEvent(SegmentEvent.AiAgentShoppingAssistantTrialCtaDisplayed, {
                ...eventData,
            })
            addBanner({
                preventDismiss: false,
                category: BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL,
                instanceId: BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL,
                type: AlertBannerTypes.Info,
                message:
                    'AI Agent just got even smarter with brand new Shopping Assistant skills, start your exclusive access to a 14-day trial',
                CTA: {
                    type: 'action',
                    text: 'Get Started',
                    onClick,
                },
            })
        } else {
            removeBanner(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL,
            )
        }
    }, [displayBanner, addBanner, removeBanner, eventData, onClick])
}
