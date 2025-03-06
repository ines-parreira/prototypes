import { useMemo } from 'react'

import { ShopifyIntegration } from 'models/integration/types'
import { useShopifyIntegrations } from 'pages/stats/convert/hooks/useShopifyIntegrations'

export const CURRENCY_USD = 'USD'

/**
 * Get the common currency of all the Shopify Integrations, or USD is no common currency.
 */
export const useCurrency = (): { currency: string; isCurrencyUSD: boolean } => {
    const shopifyIntegrations = useShopifyIntegrations() as ShopifyIntegration[]

    const currencies = Array.from(
        new Set(
            shopifyIntegrations.map((integration) => integration.meta.currency),
        ),
    )

    return useMemo(() => {
        if (currencies.length === 0) {
            return {
                currency: CURRENCY_USD,
                isCurrencyUSD: true,
            }
        }

        if (currencies.length === 1) {
            if (!currencies[0]) {
                return {
                    currency: CURRENCY_USD,
                    isCurrencyUSD: true,
                }
            }

            return {
                currency: currencies[0],
                isCurrencyUSD: currencies[0] === CURRENCY_USD,
            }
        }

        return {
            currency: CURRENCY_USD,
            isCurrencyUSD: true,
        }
    }, [currencies])
}
