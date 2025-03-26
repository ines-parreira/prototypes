import { useMemo } from 'react'

import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { IntegrationType } from 'models/integration/types'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    ConvertTrackingEventsDimension,
    ConvertTrackingEventsMeasure,
} from 'models/reporting/cubes/convert/ConvertTrackingEventsCube'
import {
    productBoughtQueryFactory,
    productClicksQueryFactory,
    productRecommendationsQueryFactory,
} from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { isFilterWithLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters } from 'models/stat/types'
import { fetchIntegrationProducts as fetchIntegrationProductsByIds } from 'state/integrations/helpers'
import { getIntegrationByIdAndType } from 'state/integrations/selectors'
import { mapMetrics } from 'utils/reporting'

import { ProductTableKeys } from '../constants'
import { ProductTableContentCell } from '../types/productTable'
import safeDivide from '../util/safeDivide'

const useProductRecommendations = (filters: StatsFilters, timezone: string) => {
    // Get recommendations totals
    const recommendationsTotalData = useMetricPerDimension(
        productRecommendationsQueryFactory(filters, timezone),
    )
    const productTotals = mapMetrics(
        recommendationsTotalData,
        AiSalesAgentConversationsDimension.ProductId,
        AiSalesAgentConversationsMeasure.Count,
    )

    // Get product clicks
    const clickTotalData = useMetricPerDimension(
        productClicksQueryFactory(filters, timezone),
    )

    // Get product bought
    const boughtTotalData = useMetricPerDimension(
        productBoughtQueryFactory(filters, timezone),
    )

    // Get product details
    const storeIntegrationId = isFilterWithLogicalOperator(
        filters.storeIntegrations,
    )
        ? filters.storeIntegrations.values[0]
        : 0

    const storeIntegration = useAppSelector(
        getIntegrationByIdAndType(storeIntegrationId, IntegrationType.Shopify),
    )

    const productIds = Object.keys(productTotals).map(Number)
    const productsData = useGetProductsByIdsFromIntegration(
        storeIntegrationId,
        productIds,
        productIds.length > 0 && !!storeIntegrationId,
    )

    const data: ProductTableContentCell[] = useMemo(() => {
        if (
            productsData.isFetching ||
            productsData.isError ||
            !productsData.data ||
            productIds.length === 0
        ) {
            return []
        }

        const clickTotals = mapMetrics(
            clickTotalData,
            ConvertTrackingEventsDimension.ProductId,
            ConvertTrackingEventsMeasure.Clicks,
        )
        const boughtTotals = mapMetrics(
            boughtTotalData,
            AiSalesAgentOrdersDimension.InfluencedProductId,
            AiSalesAgentOrdersMeasure.Count,
        )

        return productsData.data.map((product) => ({
            metrics: {
                [ProductTableKeys.NumberOfRecommendations]:
                    productTotals[product.id],
                [ProductTableKeys.CTR]:
                    safeDivide(
                        clickTotals[product.id],
                        productTotals[product.id],
                    ) * 100,
                [ProductTableKeys.BTR]:
                    safeDivide(
                        boughtTotals[product.id],
                        productTotals[product.id],
                    ) * 100,
            },
            product: {
                ...product,
                url:
                    storeIntegration !== undefined &&
                    storeIntegration.type === 'shopify' &&
                    storeIntegration.meta?.shop_domain &&
                    product?.handle
                        ? `https://${storeIntegration.meta?.shop_domain}/products/${
                              product?.handle
                          }`
                        : '',
            },
        }))
    }, [
        productIds,
        productsData,
        boughtTotalData,
        clickTotalData,
        productTotals,
        storeIntegration,
    ])

    return {
        isFetching:
            recommendationsTotalData.isFetching ||
            clickTotalData.isFetching ||
            boughtTotalData.isFetching ||
            productsData.isFetching,
        isError:
            recommendationsTotalData.isError ||
            clickTotalData.isError ||
            boughtTotalData.isError ||
            productsData.isError,
        data: data ?? [],
    }
}

const fetchProductRecommendations = async (
    filters: StatsFilters,
    timezone: string,
) => {
    try {
        // Determine store integration ID
        const storeIntegrationId = isFilterWithLogicalOperator(
            filters.storeIntegrations,
        )
            ? filters.storeIntegrations.values[0]
            : 0

        // Fetch metrics data
        const [recommendationsTotalData, clickTotalData, boughtTotalData] =
            await Promise.all([
                fetchMetricPerDimension(
                    productRecommendationsQueryFactory(filters, timezone),
                ),
                fetchMetricPerDimension(
                    productClicksQueryFactory(filters, timezone),
                ),
                fetchMetricPerDimension(
                    productBoughtQueryFactory(filters, timezone),
                ),
            ])

        // Map metrics
        const productTotals = mapMetrics(
            recommendationsTotalData,
            AiSalesAgentConversationsDimension.ProductId,
            AiSalesAgentConversationsMeasure.Count,
        )

        const clickTotals = mapMetrics(
            clickTotalData,
            ConvertTrackingEventsDimension.ProductId,
            ConvertTrackingEventsMeasure.Clicks,
        )
        const boughtTotals = mapMetrics(
            boughtTotalData,
            AiSalesAgentOrdersDimension.InfluencedProductId,
            AiSalesAgentOrdersMeasure.Count,
        )

        // Fetch product details
        const productIds = Object.keys(productTotals).map(Number)
        const productsData = await fetchIntegrationProductsByIds(
            storeIntegrationId,
            productIds,
        )

        // Map product data
        const data = (productsData ?? []).map((product) => ({
            [ProductTableKeys.Name]: product.get('title'),
            [ProductTableKeys.NumberOfRecommendations]:
                productTotals[product.get('id')],
            [ProductTableKeys.CTR]: safeDivide(
                clickTotals[product.get('id')],
                productTotals[product.get('id')],
            ),
            [ProductTableKeys.BTR]: safeDivide(
                boughtTotals[product.get('id')],
                productTotals[product.get('id')],
            ),
        }))

        return {
            data,
            isFetching: false,
            isError: false,
        }
    } catch (error) {
        console.error('Error fetching product recommendations:', error)
        return {
            data: [],
            isFetching: false,
            isError: true,
        }
    }
}

export { useProductRecommendations, fetchProductRecommendations }
