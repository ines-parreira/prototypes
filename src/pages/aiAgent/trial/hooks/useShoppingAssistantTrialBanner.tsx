import { useCallback, useEffect, useMemo } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getAiAgentBasePath } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'

export const useShoppingAssistantTrialBanner = () => {
    const { addBanner, removeBanner } = useBanners()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const userRole = useAppSelector(getRoleName)

    const { storeActivations } = useStoreActivations()

    const history = useHistory()

    const pathname = useLocation().pathname

    const isTicketsPage =
        pathname.includes('tickets') || pathname.includes('views')

    // Check if the banner should be hidden
    const { canSeeSystemBanner } = useShoppingAssistantTrialAccess()

    const displayBanner = useMemo(
        () => !isTicketsPage && canSeeSystemBanner,
        [isTicketsPage, canSeeSystemBanner],
    )

    const basePath = getAiAgentBasePath(
        Object.values(storeActivations)[0]?.name,
    )
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
                category: BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                instanceId: BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
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
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )
        }
    }, [displayBanner, addBanner, removeBanner, eventData, onClick])
}
