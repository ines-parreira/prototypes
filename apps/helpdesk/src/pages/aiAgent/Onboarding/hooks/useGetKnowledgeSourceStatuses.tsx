import useAppSelector from 'hooks/useAppSelector'
import type { HelpCenter } from 'models/helpCenter/types'
import type { ShopifyIntegration } from 'models/integration/types/shopify'
import { useOnboardingNotificationState } from 'pages/aiAgent/hooks/useOnboardingNotificationState'
import {
    KnowledgeSourceType,
    KnowledgeStatus,
} from 'pages/aiAgent/Onboarding/components/steps/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

import { useGetHelpCentersByShopName } from './useGetHelpCentersByShopName'

type KnowledgeSourceStatus = {
    isLoading: boolean
    label: string
    status: KnowledgeStatus
}

type KnowledgeSourceStatuses = {
    [KnowledgeSourceType.DOMAIN]: KnowledgeSourceStatus
    [KnowledgeSourceType.SHOPIFY]: KnowledgeSourceStatus
    [KnowledgeSourceType.HELP_CENTER]: KnowledgeSourceStatus | undefined
}
export const useGetKnowledgeSourceStatuses = (
    shopName: string,
): {
    knowledgeSources: KnowledgeSourceStatuses
    helpCenters: HelpCenter[]
} => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const {
        onboardingNotificationState,
        isLoading: isLoadingOnboardingNotification,
    } = useOnboardingNotificationState({
        accountDomain: currentAccount.get('domain'),
        shopName,
    })

    const shopifyIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    const { isHelpCenterLoading, helpCenters } = useGetHelpCentersByShopName(
        shopName || '',
    )
    const hasHelpCenter = !!helpCenters.length

    return {
        knowledgeSources: {
            [KnowledgeSourceType.DOMAIN]: {
                isLoading: isLoadingOnboardingNotification,
                label: shopifyIntegration.meta.shop_domain ?? 'Domain URL',
                status: onboardingNotificationState?.scrapingProcessingFinishedDatetime
                    ? KnowledgeStatus.DONE
                    : KnowledgeStatus.IN_PROGRESS,
            },
            [KnowledgeSourceType.SHOPIFY]: {
                isLoading: false,
                label: 'Shopify Store',
                status: KnowledgeStatus.DONE,
            },
            [KnowledgeSourceType.HELP_CENTER]: isHelpCenterLoading
                ? {
                      isLoading: true,
                      label: 'Help Center',
                      status: KnowledgeStatus.IN_PROGRESS,
                  }
                : hasHelpCenter
                  ? {
                        isLoading: isHelpCenterLoading,
                        label: helpCenters[0]?.name ?? 'Help Center',
                        status: KnowledgeStatus.DONE,
                    }
                  : undefined,
        },
        helpCenters,
    }
}
