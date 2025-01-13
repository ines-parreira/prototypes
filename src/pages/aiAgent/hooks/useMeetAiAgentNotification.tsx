import {useEffect, useState} from 'react'

import {AiAgentNotificationType} from 'automate/notifications/types'
import useAppSelector from 'hooks/useAppSelector'
import {ShopifyIntegration} from 'models/integration/types'

import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'
import {getHasAutomate} from 'state/billing/selectors'

import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {useAiAgentOnboardingNotification} from './useAiAgentOnboardingNotification'
import {useStoreConfiguration} from './useStoreConfiguration'

const useMeetAiAgentNotifications = () => {
    const hasAutomateSubscription = useAppSelector(getHasAutomate)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const shopifyStoreIntegrations: ShopifyIntegration[] =
        useShopifyIntegrations()
    const [storeIndex, setStoreIndex] = useState(0)
    const shopName = shopifyStoreIntegrations[storeIndex].meta?.shop_name

    const {
        isAdmin,
        isLoading,
        onboardingNotificationState,
        handleOnSendOrCancelNotification,
        isAiAgentOnboardingNotificationEnabled,
    } = useAiAgentOnboardingNotification({shopName})

    const {isLoading: isLoadingStoreConfiguration, storeConfiguration} =
        useStoreConfiguration({
            shopName,
            accountDomain,
            withWizard: true,
        })

    useEffect(() => {
        if (
            isLoading ||
            isLoadingStoreConfiguration ||
            !isAdmin ||
            !isAiAgentOnboardingNotificationEnabled
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

        if (hasAutomateSubscription) {
            handleOnSendOrCancelNotification({
                aiAgentNotificationType: AiAgentNotificationType.MeetAiAgent,
            })
        }
    }, [
        handleOnSendOrCancelNotification,
        hasAutomateSubscription,
        isAdmin,
        isAiAgentOnboardingNotificationEnabled,
        isLoading,
        isLoadingStoreConfiguration,
        onboardingNotificationState?.meetAiAgentNotificationReceivedDatetime,
        onboardingNotificationState?.onboardingState,
        shopifyStoreIntegrations.length,
        storeConfiguration,
        storeIndex,
    ])
}

export default useMeetAiAgentNotifications
