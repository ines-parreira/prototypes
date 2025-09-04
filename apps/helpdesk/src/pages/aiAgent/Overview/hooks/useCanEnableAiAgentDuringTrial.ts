import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, ShopifyIntegration } from 'models/integration/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { extractShopNameFromUrl } from 'pages/aiAgent/components/ShoppingAssistant/utils/extractShopNameFromUrl'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { getIntegrationsByType } from 'state/integrations/selectors'

/**
 * Hook to determine if the AI agent is during trial period
 *
 * @param shopName - Optional shop name parameter, if not provided it will be extracted from URL
 * @returns boolean - true if store is during trial period, false otherwise
 */
export const useCanEnableAiAgentDuringTrial = (
    shopName?: string,
): {
    storeIntegration?: ShopifyIntegration
    isDuringTrial: boolean
    isLoading: boolean
    isError: boolean
} => {
    const routeShopName = extractShopNameFromUrl(window.location.href)

    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify),
    )

    const currentShopName = shopName || routeShopName

    const storeIntegration = shopifyIntegrations.find(
        (integration) => integration.meta.shop_name === currentShopName,
    )

    const trialAccess = useTrialAccess(currentShopName)

    const isDuringTrial =
        trialAccess.trialType === TrialType.AiAgent &&
        trialAccess.hasCurrentStoreTrialStarted &&
        !trialAccess.hasCurrentStoreTrialExpired

    return {
        storeIntegration,
        isDuringTrial,
        isLoading: trialAccess.isLoading || false,
        isError: trialAccess.isError || false,
    }
}
