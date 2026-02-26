import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { getCurrentAccountCreatedDatetime } from 'state/currentAccount/selectors'
import * as integrationsSelectors from 'state/integrations/selectors'

export const CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE = new Date(
    '2025-08-31T23:59:59Z',
)

// Chat "Article recommendation" is being sunsetted in favor of the "AI Agent" in multiple phases
// Phase 1:
// - Disable feature for all new merchants (registered from Sep 1)
// - Keep feature available for Magento / BigC merchants
// - Show "Article recommendation" tab in the sidebar in Settings
// Phase 2:
// - Hide "Article recommendation" tab in the sidebar
// - Disable feature for selected Shopify merchants: https://docs.google.com/spreadsheets/d/1fOcGubC9FIqmzNkXWmVHLwex6paPwg8g7c9AFp28QLM/edit?gid=0#gid=0
// - Keep feature available for Magento / BigC merchants
// - In case merchant has a mix of Magento / BigC and Shopify integrations, make feature available only for Magento / BigC integrations
export function useIsArticleRecommendationsEnabledWhileSunset() {
    const hasNonShopifyIntegration =
        useAppSelector(
            integrationsSelectors.getIntegrationsByTypes([
                IntegrationType.BigCommerce,
                IntegrationType.Magento2,
            ]),
        ).length > 0

    const isNewMerchant =
        new Date(useAppSelector(getCurrentAccountCreatedDatetime)) >
        CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE

    const isArticleRecommendationDeprecatedInShopify = useFlag<boolean>(
        FeatureFlagKey.DisableArticleRecommendationForShopify,
        false,
    )

    const enabledInSettings = isArticleRecommendationDeprecatedInShopify
        ? false
        : hasNonShopifyIntegration || !isNewMerchant

    const enabledInStatistics = hasNonShopifyIntegration || !isNewMerchant

    return {
        enabledInSettings,
        enabledInStatistics,
    }
}
