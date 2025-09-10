import { useEffect, useMemo } from 'react'

import { useLocation } from 'react-router-dom'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, ShopifyIntegration } from 'models/integration/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'

/**
 * AI Agent trial banner (system-wide)
 * Conditions:
 * - At least 1 Shopify store connected
 * - No AI Agent subscription
 * - Have not had an AI Agent trial already (no trial started across stores)
 */
export const useAiAgentTrialBanner = () => {
    const { addBanner, removeBanner } = useBanners()

    // At least 1 Shopify store connected
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify),
    )
    const hasShopify = (shopifyIntegrations?.length ?? 0) > 0

    // No AI Agent subscription => no Automate plan
    const hasAutomate = useAppSelector(getHasAutomate)
    const noAiAgentSubscription = !hasAutomate

    const { canSeeSystemBanner, trialType } = useTrialAccess()

    const pathname = useLocation().pathname
    const isTicketsPage =
        pathname.includes('tickets') || pathname.includes('views')

    const shouldDisplay = useMemo(
        () =>
            Boolean(
                hasShopify &&
                    noAiAgentSubscription &&
                    !isTicketsPage &&
                    canSeeSystemBanner,
            ),
        [hasShopify, noAiAgentSubscription, isTicketsPage, canSeeSystemBanner],
    )

    const firstShopName = shopifyIntegrations?.[0]?.meta?.shop_name ?? ''
    const { routes } = useAiAgentNavigation({ shopName: firstShopName })

    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const userRole = useAppSelector(getRoleName)
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

    useEffect(() => {
        if (shouldDisplay) {
            logEvent(SegmentEvent.TrialSystemWideBannerViewed, {
                ...eventData,
            })
            addBanner({
                preventDismiss: false,
                category: BannerCategories.AI_AGENT_TRIAL,
                instanceId: BannerCategories.AI_AGENT_TRIAL,
                type: AlertBannerTypes.Info,
                message:
                    'Discover AI Agent to power every step of your shopper’s journey with conversations that convert and drive repeat purchases',
                CTA: {
                    type: 'internal',
                    text: 'Start 14-day FREE trial',
                    to: routes.overview,
                    onClick: () => {
                        logEvent(SegmentEvent.TrialSystemWideBannerCTAClicked, {
                            ...eventData,
                        })
                    },
                },
            })
        } else {
            removeBanner(
                BannerCategories.AI_AGENT_TRIAL,
                BannerCategories.AI_AGENT_TRIAL,
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldDisplay, addBanner, removeBanner, routes, eventData])
}

export default useAiAgentTrialBanner
