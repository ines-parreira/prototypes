import { useMemo } from 'react'

import { reportError } from '@repo/logging'
import type { ChartDataItem } from '@repo/reporting'
import { useQueries } from '@tanstack/react-query'

import type { Product } from 'constants/integrations/types/shopify'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import type { StringWhichShouldBeNumber } from 'domains/reporting/hooks/types'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { gmvByInfluencedProductQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { useGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { fetchIntegrationProducts } from 'state/integrations/helpers'

type TotalSalesByProductData = {
    chartData: ChartDataItem[]
    totalValue: number | null
    prevTotalValue: number | null
    currency: string
}

type UseTotalSalesByProductResult = {
    data: TotalSalesByProductData
    isFetching: boolean
    isError: boolean
}

type ProductsByIntegration = {
    integrationId: number
    productIds: number[]
}

export const useTotalSalesByProduct = (): UseTotalSalesByProductResult => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const totalSalesTrend = useGmvInfluencedTrend(statsFilters, userTimezone)

    const gmvByProductData = useMetricPerDimension<StringWhichShouldBeNumber>(
        gmvByInfluencedProductQueryFactory(statsFilters, userTimezone),
    )
    const productsByIntegration = useMemo((): ProductsByIntegration[] => {
        if (!gmvByProductData.data?.allData) {
            return []
        }

        const groupedProducts = new Map<number, number[]>()

        gmvByProductData.data.allData.forEach((item) => {
            const integrationId =
                Number(item[AiSalesAgentOrdersDimension.IntegrationId]) || 0
            const productId =
                Number(item[AiSalesAgentOrdersDimension.InfluencedProductId]) ||
                0

            if (integrationId === 0 || productId === 0) return

            const existingProducts = groupedProducts.get(integrationId) || []
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
    }, [gmvByProductData.data?.allData])

    const productsQueries = useQueries({
        queries: productsByIntegration.map(({ integrationId, productIds }) => ({
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
        })),
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

    const chartData: ChartDataItem[] = useMemo(() => {
        if (
            !gmvByProductData.data?.allData ||
            gmvByProductData.data.allData.length === 0
        ) {
            return []
        }

        return gmvByProductData.data.allData
            .map((item) => {
                const productId = Number(
                    item[AiSalesAgentOrdersDimension.InfluencedProductId],
                )
                const gmv = Number(item[AiSalesAgentOrdersMeasure.Gmv]) || 0
                const product = allProducts.get(productId)

                return {
                    name: product?.title ?? `Product ${productId}`,
                    value: gmv,
                }
            })
            .filter((item) => item.value > 0)
    }, [gmvByProductData.data?.allData, allProducts])

    const productsIsFetching = productsQueries.some((query) => query.isFetching)
    const productsIsError = productsQueries.some((query) => query.isError)

    const isFetching =
        totalSalesTrend.isFetching ||
        gmvByProductData.isFetching ||
        productsIsFetching

    const isError =
        totalSalesTrend.isError || gmvByProductData.isError || productsIsError

    return {
        data: {
            chartData,
            totalValue: totalSalesTrend.data?.value ?? null,
            prevTotalValue: totalSalesTrend.data?.prevValue ?? null,
            currency: totalSalesTrend.data?.currency ?? 'USD',
        },
        isFetching,
        isError,
    }
}
