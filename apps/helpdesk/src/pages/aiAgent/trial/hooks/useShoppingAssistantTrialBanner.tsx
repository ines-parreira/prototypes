import { useEffect, useMemo } from 'react'

import { useLocation } from 'react-router-dom'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'

/** System banner to warn user for Shopping Assistant Trial */
export const useShoppingAssistantTrialBanner = () => {
    const { addBanner, removeBanner } = useBanners()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const userRole = useAppSelector(getRoleName)

    const { storeActivations } = useStoreActivations()

    const pathname = useLocation().pathname

    const isTicketsPage =
        pathname.includes('tickets') || pathname.includes('views')

    const isShoppingAssistantPage = pathname.includes('sales')

    // Check if the banner should be hidden
    const { canSeeSystemBanner, trialType } = useTrialAccess()

    const displayBanner = useMemo(
        () => !isTicketsPage && !isShoppingAssistantPage && canSeeSystemBanner,
        [isTicketsPage, isShoppingAssistantPage, canSeeSystemBanner],
    )

    const eventData = useMemo(
        () => ({
            accountId: currentAccount.get('id'),
            userId: currentUser.get('id'),
            userRole: userRole || '',
            type: 'system-banner',
            trialType,
        }),
        [currentAccount, currentUser, userRole, trialType],
    )

    const firstStore = Object.values(storeActivations)[0]
    const { routes } = useAiAgentNavigation({
        shopName: firstStore?.name ?? '',
    })

    useEffect(() => {
        if (firstStore && displayBanner) {
            logEvent(SegmentEvent.TrialSystemWideBannerViewed, {
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
                    type: 'internal',
                    text: 'Get Started',
                    to: routes.sales,
                    onClick: () => {
                        logEvent(SegmentEvent.TrialSystemWideBannerCTAClicked, {
                            ...eventData,
                        })
                    },
                },
            })
        } else {
            removeBanner(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )
        }
    }, [firstStore, displayBanner, addBanner, removeBanner, routes, eventData])
}
