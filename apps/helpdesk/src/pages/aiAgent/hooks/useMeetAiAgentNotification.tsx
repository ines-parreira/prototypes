import { useEffect, useState } from 'react'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import useAppSelector from 'hooks/useAppSelector'
import type { ShopifyIntegration } from 'models/integration/types'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useAiAgentOnboardingNotification } from './useAiAgentOnboardingNotification'
import { useStoreConfiguration } from './useStoreConfiguration'

const useMeetAiAgentNotifications = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountId = currentAccount.get('id')
    const accountDomain = currentAccount.get('domain')
    const shopifyStoreIntegrations: ShopifyIntegration[] =
        useShopifyIntegrations()
    const storeNames = shopifyStoreIntegrations.map(
        (integration) => integration.meta.shop_name,
    )
    const [storeIndex, setStoreIndex] = useState(0)
    const shopName: string | undefined =
        shopifyStoreIntegrations[storeIndex]?.meta?.shop_name

    const { hasAccess } = useAiAgentAccess(shopName)

    const {
        status: accountConfigRetrievalStatus,
        isLoading: isLoadingAccountConfiguration,
    } = useGetOrCreateAccountConfiguration(
        { accountId, accountDomain, storeNames },
        { refetchOnWindowFocus: false, enabled: hasAccess },
    )

    const {
        isAdmin,
        isLoading: isLoadingOnboardingNotificationState,
        onboardingNotificationState,
        handleOnSendOrCancelNotification,
        isAiAgentOnboardingNotificationEnabled,
    } = useAiAgentOnboardingNotification({
        shopName,
        hasAutomateSubscription: hasAccess,
    })

    const { isLoading: isLoadingStoreConfiguration, storeConfiguration } =
        useStoreConfiguration({
            shopName,
            accountDomain,
            enabled: hasAccess,
        })

    useEffect(() => {
        if (
            isLoadingAccountConfiguration ||
            isLoadingOnboardingNotificationState ||
            isLoadingStoreConfiguration ||
            !isAdmin ||
            !isAiAgentOnboardingNotificationEnabled ||
            accountConfigRetrievalStatus !== 'success'
        )
            return

        if (storeIndex < shopifyStoreIntegrations.length - 1) {
            setStoreIndex((prev) => prev + 1)
        }

        const isAlreadyMeetAiAgent =
            !!onboardingNotificationState?.onboardingState
        const isMeetAiAgentNotificationAlreadyReceived =
            !!onboardingNotificationState?.meetAiAgentNotificationReceivedDatetime
        const hasStoreConfiguration = !!storeConfiguration

        if (
            isMeetAiAgentNotificationAlreadyReceived ||
            isAlreadyMeetAiAgent ||
            hasStoreConfiguration
        )
            return

        if (hasAccess) {
            handleOnSendOrCancelNotification({
                aiAgentNotificationType: AiAgentNotificationType.MeetAiAgent,
            })
        }
    }, [
        accountConfigRetrievalStatus,
        handleOnSendOrCancelNotification,
        hasAccess,
        isAdmin,
        isAiAgentOnboardingNotificationEnabled,
        isLoadingAccountConfiguration,
        isLoadingOnboardingNotificationState,
        isLoadingStoreConfiguration,
        onboardingNotificationState?.meetAiAgentNotificationReceivedDatetime,
        onboardingNotificationState?.onboardingState,
        shopifyStoreIntegrations.length,
        storeConfiguration,
        storeIndex,
    ])
}

export default useMeetAiAgentNotifications
