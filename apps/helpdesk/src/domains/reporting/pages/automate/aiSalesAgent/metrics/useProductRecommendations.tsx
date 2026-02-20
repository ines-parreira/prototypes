import { useMemo } from 'react'

import type { StringWhichShouldBeNumber } from 'domains/reporting/hooks/types'
import {
    fetchMetricPerDimension,
    fetchMetricPerDimensionV2,
    useMetricPerDimension,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    ConvertTrackingEventsDimension,
    ConvertTrackingEventsMeasure,
} from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import {
    productBoughtQueryFactory,
    productClicksQueryFactory,
    productRecommendationsQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { isFilterWithLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AISalesAgentProductBoughtQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import type { ProductTableContentCell } from 'domains/reporting/pages/automate/aiSalesAgent/types/productTable'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'
import { mapMetrics } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { IntegrationType } from 'models/integration/types'
import { fetchIntegrationProducts as fetchIntegrationProductsByIds } from 'state/integrations/helpers'
import { getIntegrationByIdAndType } from 'state/integrations/selectors'

import { AISalesAgentProductRecommendationsCountQueryFactoryV2 } from '../../../../models/scopes/AISalesAgentConversations'

const useProductRecommendations = (filters: StatsFilters, timezone: string) => {
    // Get recommendations totals
    const recommendationsTotalData = useMetricPerDimensionV2(
        productRecommendationsQueryFactory(filters, timezone),
        AISalesAgentProductRecommendationsCountQueryFactoryV2({
            filters,
            timezone,
        }),
        AiSalesAgentConversationsDimension.ProductId,
    )
    const productTotals = mapMetrics(
        recommendationsTotalData,
        AiSalesAgentConversationsDimension.ProductId,
        AiSalesAgentConversationsMeasure.Count,
    )

    // Get product clicks
    const clickTotalData = useMetricPerDimension<StringWhichShouldBeNumber>(
        productClicksQueryFactory(filters, timezone),
    )

    // Get product bought
    const boughtTotalData = useMetricPerDimensionV2(
        productBoughtQueryFactory(filters, timezone),
        AISalesAgentProductBoughtQueryFactoryV2({ filters, timezone }),
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
            ConvertTrackingEventsMeasure.UniqClicks,
        )
        const boughtTotals = mapMetrics(
            boughtTotalData,
            AiSalesAgentOrdersDimension.InfluencedProductId,
            AiSalesAgentOrdersMeasure.UniqCount,
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
                fetchMetricPerDimensionV2<StringWhichShouldBeNumber>(
                    productRecommendationsQueryFactory(filters, timezone),
                    AISalesAgentProductRecommendationsCountQueryFactoryV2({
                        filters,
                        timezone,
                    }),
                ),
                fetchMetricPerDimension<StringWhichShouldBeNumber>(
                    productClicksQueryFactory(filters, timezone),
                ),
                fetchMetricPerDimensionV2<StringWhichShouldBeNumber>(
                    productBoughtQueryFactory(filters, timezone),
                    AISalesAgentProductBoughtQueryFactoryV2({
                        filters,
                        timezone,
                    }),
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
            ConvertTrackingEventsMeasure.UniqClicks,
        )
        const boughtTotals = mapMetrics(
            boughtTotalData,
            AiSalesAgentOrdersDimension.InfluencedProductId,
            AiSalesAgentOrdersMeasure.UniqCount,
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
