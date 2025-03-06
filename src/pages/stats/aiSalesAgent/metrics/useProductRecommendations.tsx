import { useMemo } from 'react'

import {
    MetricWithDecile,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { Cubes } from 'models/reporting/cubes'
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
import { StatsFilters } from 'models/stat/types'

import { ProductTableKeys } from '../constants'
import { ProductTableContentCell } from '../types/productTable'
import safeDivide from '../util/safeDivide'

function mapMetrics<TCube extends Cubes = Cubes>(
    metrics: MetricWithDecile<TCube>,
    dimension: TCube['dimensions'],
    measure: TCube['measures'],
) {
    if (metrics.isFetching || metrics.isError || !metrics.data) {
        return {}
    }

    return metrics.data.allData.reduce<Record<number, number>>(
        (a, record) => ({
            ...a,
            [Number(record[dimension])]: Number(record[measure]),
        }),
        {},
    )
}

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
    const productIds = Object.keys(productTotals).map(Number)
    const productsData = useGetProductsByIdsFromIntegration(
        // TODO - get integrationId from filters
        // athlete-shift id is hardcoded here
        6438,
        productIds,
        !!productIds,
    )

    const data: ProductTableContentCell[] = useMemo(() => {
        if (
            productsData.isFetching ||
            productsData.isError ||
            !productsData.data
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
            product: product,
        }))
    }, [productsData, boughtTotalData, clickTotalData, productTotals])

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

export { useProductRecommendations }
