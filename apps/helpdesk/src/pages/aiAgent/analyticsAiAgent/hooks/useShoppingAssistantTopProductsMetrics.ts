import { useMemo } from 'react'

import { useQueries } from '@tanstack/react-query'

import type { Product } from 'constants/integrations/types/shopify'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StringWhichShouldBeNumber } from 'domains/reporting/hooks/types'
import {
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
} from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { shoppingAssistantTopProductsQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/shoppingAssistantChannelMetrics'
import { AISalesAgentProductBoughtQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import { aiSalesAgentProductClicksQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignEvents'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import type { ProductTableContentCell } from 'domains/reporting/pages/automate/aiSalesAgent/types/productTable'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'
import { mapMetrics } from 'domains/reporting/utils/reporting'
import { fetchIntegrationProducts } from 'state/integrations/helpers'
import { reportError } from 'utils/errors'

type ProductsByIntegration = {
    integrationId: number
    productIds: number[]
}

type UseShoppingAssistantTopProductsMetricsResult = {
    data: ProductTableContentCell[]
    isFetching: boolean
    isError: boolean
}

export const useShoppingAssistantTopProductsMetrics =
    (): UseShoppingAssistantTopProductsMetricsResult => {
        const { cleanStatsFilters, userTimezone } = useStatsFilters()

        const recommendationsTotalData =
            useMetricPerDimension<StringWhichShouldBeNumber>(
                shoppingAssistantTopProductsQueryFactory(
                    cleanStatsFilters,
                    userTimezone,
                ),
            )

        const clickTotalData = useMetricPerDimensionV2(
            productClicksQueryFactory(cleanStatsFilters, userTimezone),
            aiSalesAgentProductClicksQueryFactoryV2({
                filters: cleanStatsFilters,
                timezone: userTimezone,
            }),
        )

        const boughtTotalData = useMetricPerDimensionV2(
            productBoughtQueryFactory(cleanStatsFilters, userTimezone),
            AISalesAgentProductBoughtQueryFactoryV2({
                filters: cleanStatsFilters,
                timezone: userTimezone,
            }),
        )

        const productsByIntegration = useMemo((): ProductsByIntegration[] => {
            if (!recommendationsTotalData.data?.allData) {
                return []
            }

            const groupedProducts = new Map<number, number[]>()

            recommendationsTotalData.data.allData.forEach((item) => {
                const integrationId =
                    Number(
                        item[
                            AiSalesAgentConversationsDimension
                                .StoreIntegrationId
                        ],
                    ) || 0
                const productId =
                    Number(
                        item[AiSalesAgentConversationsDimension.ProductId],
                    ) || 0

                if (integrationId === 0 || productId === 0) return

                const existingProducts =
                    groupedProducts.get(integrationId) || []
                if (!existingProducts.includes(productId)) {
                    groupedProducts.set(integrationId, [
                        ...existingProducts,
                        productId,
                    ])
                }
            })

            return Array.from(groupedProducts.entries()).map(
                ([integrationId, productIds]) => ({
                    integrationId,
                    productIds,
                }),
            )
        }, [recommendationsTotalData.data?.allData])

        const productsQueries = useQueries({
            queries: productsByIntegration.map(
                ({ integrationId, productIds }) => ({
                    queryKey: [
                        'integration',
                        'shopify',
                        integrationId,
                        'products',
                        productIds,
                    ],
                    queryFn: async () => {
                        const results = await fetchIntegrationProducts(
                            integrationId,
                            productIds,
                        )
                        return results.map((r) => r.toJS()) as Product[]
                    },
                    staleTime: Infinity,
                    enabled: productIds.length > 0,
                    onError: () => {
                        reportError(
                            new Error(
                                `Failed to fetch products for integration ${integrationId}`,
                            ),
                        )
                    },
                }),
            ),
        })

        const allProducts = useMemo(() => {
            const productMap = new Map<number, Product>()
            productsQueries.forEach((query) => {
                if (query.data) {
                    query.data.forEach((product) => {
                        productMap.set(product.id, product)
                    })
                }
            })
            return productMap
        }, [productsQueries])

        const productTotals = mapMetrics(
            recommendationsTotalData,
            AiSalesAgentConversationsDimension.ProductId,
            AiSalesAgentConversationsMeasure.Count,
        )

        const data: ProductTableContentCell[] = useMemo(() => {
            if (
                !recommendationsTotalData.data?.allData ||
                recommendationsTotalData.data.allData.length === 0
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

            const seenProductIds = new Set<number>()
            const results: ProductTableContentCell[] = []

            recommendationsTotalData.data.allData.forEach((item) => {
                const productId = Number(
                    item[AiSalesAgentConversationsDimension.ProductId],
                )

                if (seenProductIds.has(productId)) return
                seenProductIds.add(productId)

                const product = allProducts.get(productId)

                results.push({
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]:
                            productTotals[productId] ?? 0,
                        [ProductTableKeys.CTR]:
                            safeDivide(
                                clickTotals[productId],
                                productTotals[productId],
                            ) * 100,
                        [ProductTableKeys.BTR]:
                            safeDivide(
                                boughtTotals[productId],
                                productTotals[productId],
                            ) * 100,
                    },
                    product: {
                        id: productId,
                        title: product?.title ?? `Product ${productId}`,
                        handle: product?.handle ?? '',
                        image: product?.image ?? null,
                        images: product?.images ?? [],
                        options: product?.options ?? [],
                        variants: product?.variants ?? [],
                        created_at: product?.created_at ?? '',
                        url: '',
                    },
                })
            })

            return results
        }, [
            recommendationsTotalData.data?.allData,
            clickTotalData,
            boughtTotalData,
            productTotals,
            allProducts,
        ])

        const productsIsFetching = productsQueries.some(
            (query) => query.isFetching,
        )
        const productsIsError = productsQueries.some((query) => query.isError)

        const isFetching =
            recommendationsTotalData.isFetching ||
            clickTotalData.isFetching ||
            boughtTotalData.isFetching ||
            productsIsFetching

        const isError =
            recommendationsTotalData.isError ||
            clickTotalData.isError ||
            boughtTotalData.isError ||
            productsIsError

        return {
            data,
            isFetching,
            isError,
        }
    }
