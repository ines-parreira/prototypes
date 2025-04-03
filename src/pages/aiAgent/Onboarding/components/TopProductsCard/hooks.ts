import { useMemo } from 'react'

import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { topProductRecommendationsQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { isFilterWithLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters } from 'models/stat/types'
import { mockedProducts } from 'pages/aiAgent/Onboarding/components/KnowledgePreview/constants'
import { Product } from 'pages/aiAgent/Onboarding/components/TopProductsCard/types'
import { mapMetrics } from 'utils/reporting'

let useTopProductsImplementation = ({
    filters,
    timezone,
    currency,
}: {
    filters: StatsFilters
    timezone: string
    currency?: string
}): { data: Product[]; isLoading: boolean } => {
    const shopIntegrationId = isFilterWithLogicalOperator(
        filters.storeIntegrations,
    )
        ? filters.storeIntegrations.values[0]
        : 0

    let productIds = []
    const recommendationsTotalData = useMetricPerDimension(
        topProductRecommendationsQueryFactory(filters, timezone),
        undefined,
        productIds.length === 0, // if there are productIds, we don't need to refresh data
    )

    const productTotals = mapMetrics(
        recommendationsTotalData,
        AiSalesAgentOrdersDimension.ProductId,
        AiSalesAgentOrdersMeasure.Count,
    )

    productIds = Object.keys(productTotals).map(Number)
    const productsData = useGetProductsByIdsFromIntegration(
        shopIntegrationId,
        productIds,
        productIds.length > 0 && !!shopIntegrationId,
    )

    const data = useMemo<Product[]>(() => {
        if (productsData.isFetching) {
            return []
        }

        if (!productsData.data || productIds.length === 0) {
            return mockedProducts
        }

        return productsData.data.slice(0, 2).map(
            (product) =>
                ({
                    id: product.id,
                    title: product.title,
                    description: `${productTotals[product.id]} sales`,
                    featuredImage: product.images[0]?.src,
                    price: product.variants[0]?.price,
                    currency: currency ?? 'USD',
                }) as unknown as Product,
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productsData, productTotals, productIds])

    return {
        isLoading:
            recommendationsTotalData.isFetching || productsData.isFetching,
        data,
    }
}

// Workaround for Storybook
export const useTopProducts = (args: {
    filters: StatsFilters
    timezone: string
    currency?: string
}) => useTopProductsImplementation(args)

// Allow overwriting the hook for testing or Storybook
export const setUseTopProducts = (
    mockImplementation: typeof useTopProductsImplementation,
) => {
    useTopProductsImplementation = mockImplementation
}

export default useTopProducts
