import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQueries } from '@tanstack/react-query'

import type { Product } from 'constants/integrations/types/shopify'
import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import type { ProductTableContentCell } from 'domains/reporting/pages/automate/aiSalesAgent/types/productTable'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'
import useAppSelector from 'hooks/useAppSelector'
import { SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantTopProductsTable/columns'
import {
    fetchBuyThroughRatePerProduct,
    useBuyThroughRatePerProduct,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useBuyThroughRatePerProduct'
import {
    fetchProductClicksPerProduct,
    useProductClicksPerProduct,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useProductClicksPerProduct'
import {
    fetchTimesRecommendedPerProduct,
    useTimesRecommendedPerProduct,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useRecommendedProductCountPerProduct'
import { fetchIntegrationProducts } from 'state/integrations/helpers'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { createCsv } from 'utils/file'

type ProductsByIntegration = {
    integrationId: number
    productIds: number[]
}

const parseProductIds = (value: unknown): number[] => {
    const raw = String(value ?? '[]').replace(/'/g, '"')
    try {
        return (JSON.parse(raw) as (number | string)[]).map(Number)
    } catch {
        return []
    }
}

const buildProductsFromRecommendations = (
    allData: Record<string, unknown>[],
): {
    productsByIntegration: ProductsByIntegration[]
    productIds: number[]
    totalRecommendedById: Partial<Record<number, number>>
} => {
    const integrationMap = new Map<number, number[]>()
    const totalRecommendedById: Partial<Record<number, number>> = {}

    allData.forEach((row) => {
        const integrationId = Number(row.storeIntegrationId)
        const ids = parseProductIds(row.productRecommended)
        const count = Number(row.timesRecommended ?? 0)

        integrationMap.set(integrationId, [
            ...(integrationMap.get(integrationId) ?? []),
            ...ids,
        ])

        ids.forEach((productId) => {
            totalRecommendedById[productId] =
                (totalRecommendedById[productId] ?? 0) + count
        })
    })

    const productsByIntegration = Array.from(integrationMap.entries()).map(
        ([integrationId, productIds]) => ({ integrationId, productIds }),
    )

    const productIds = productsByIntegration.flatMap(
        ({ productIds: ids }) => ids,
    )

    return {
        productsByIntegration,
        productIds,
        totalRecommendedById,
    }
}

const getUniqClicks = (
    allData: Record<string, unknown>[],
    productId: number,
): number =>
    Number(
        allData.find((v) => String(v.productId) === String(productId))
            ?.uniqClicks,
    )

const getBuyThroughRate = (
    allData: Record<string, unknown>[],
    productId: number,
): number =>
    Number(
        allData.find((v) =>
            parseProductIds(v.productRecommended).includes(productId),
        )?.productBuyThroughRate,
    ) || 0

const buildProductUrl = (
    handle: string | undefined,
    shopDomain: string | undefined,
): string => {
    if (!handle || !shopDomain) return ''
    return `https://${shopDomain}/products/${handle}`
}

export type ShoppingAssistantTopProductRow = {
    entity: string
    [ProductTableKeys.NumberOfRecommendations]: number
    [ProductTableKeys.CTR]: number
    [ProductTableKeys.BTR]: number
}

type TransformedShoppingAssistantTopProducts = {
    flatData: ShoppingAssistantTopProductRow[]
    productNameMap: Record<string, string>
    productUrlMap: Record<string, string | undefined>
    productImageMap: Record<string, string | undefined>
}

const transformShoppingAssistantTopProducts = (
    data: ProductTableContentCell[],
): TransformedShoppingAssistantTopProducts => {
    const productNameMap = Object.fromEntries(
        data.map((item) => [
            String(item.product.id),
            item.product.title || `Product ${item.product.id}`,
        ]),
    )
    const productUrlMap = Object.fromEntries(
        data.map((item) => [
            String(item.product.id),
            item.product.url || undefined,
        ]),
    )
    const productImageMap = Object.fromEntries(
        data.map((item) => [
            String(item.product.id),
            item.product.image?.src ?? item.product.images?.[0]?.src,
        ]),
    )
    const flatData: ShoppingAssistantTopProductRow[] = data.map((item) => ({
        entity: String(item.product.id),
        [ProductTableKeys.NumberOfRecommendations]: Number(
            item.metrics[ProductTableKeys.NumberOfRecommendations] ?? 0,
        ),
        [ProductTableKeys.CTR]: Number(item.metrics[ProductTableKeys.CTR] ?? 0),
        [ProductTableKeys.BTR]: Number(item.metrics[ProductTableKeys.BTR] ?? 0),
    }))
    return { flatData, productNameMap, productUrlMap, productImageMap }
}

type UseShoppingAssistantTopProductsMetricsResult =
    TransformedShoppingAssistantTopProducts & {
        isFetching: boolean
        isError: boolean
    }

export const useShoppingAssistantTopProductsMetrics =
    (): UseShoppingAssistantTopProductsMetricsResult => {
        const { cleanStatsFilters, userTimezone } = useStatsFilters()
        const periodFilters = useMemo(
            () => ({ period: cleanStatsFilters.period }),
            [cleanStatsFilters],
        )

        const {
            data: timesRecommended,
            isFetching: isRecommendationsFetching,
            isError: isRecommendationsError,
        } = useTimesRecommendedPerProduct(periodFilters, userTimezone)

        const {
            data: clicksData,
            isFetching: isClicksFetching,
            isError: isClicksError,
        } = useProductClicksPerProduct(periodFilters, userTimezone)

        const {
            data: btrData,
            isFetching: isBtrFetching,
            isError: isBtrError,
        } = useBuyThroughRatePerProduct(periodFilters, userTimezone)

        const shopifyIntegrations = useAppSelector(
            getShopifyIntegrationsSortedByName,
        )

        const { productsByIntegration, productIds, totalRecommendedById } =
            useMemo(
                () =>
                    buildProductsFromRecommendations(
                        timesRecommended?.allData ?? [],
                    ),
                [timesRecommended],
            )

        const shopDomainByIntegrationId = useMemo(
            () =>
                new Map(
                    shopifyIntegrations.map((i) => [
                        i.id,
                        i.meta?.shop_domain ?? '',
                    ]),
                ),
            [shopifyIntegrations],
        )

        const integrationByProductId = useMemo(
            () =>
                new Map(
                    productsByIntegration.flatMap(
                        ({ integrationId, productIds: ids }) =>
                            ids.map((id) => [id, integrationId]),
                    ),
                ),
            [productsByIntegration],
        )

        const productsQueries = useQueries({
            queries: productsByIntegration.map(
                ({
                    integrationId,
                    productIds: ids,
                }): UseQueryOptions<Product[]> => ({
                    queryKey: [
                        'integration',
                        'shopify',
                        integrationId,
                        'products',
                        ids,
                    ],
                    queryFn: async () => {
                        const results = await fetchIntegrationProducts(
                            integrationId,
                            ids,
                        )
                        return results.map((r) => r.toJS()) as Product[]
                    },
                    staleTime: Infinity,
                    enabled: ids.length > 0,
                }),
            ),
        })

        const allProducts = useMemo(() => {
            const productMap = new Map<number, Product>()
            productsQueries.forEach((query) => {
                if (query.data) {
                    query.data.forEach((product) =>
                        productMap.set(Number(product.id), product),
                    )
                }
            })
            return productMap
        }, [productsQueries])

        const data: ProductTableContentCell[] = useMemo(() => {
            if (!productIds.length) {
                return []
            }

            return productIds.map((productId) => {
                const product = allProducts.get(productId)
                const count = totalRecommendedById[productId]
                return {
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: count ?? 0,
                        [ProductTableKeys.CTR]: safeDivide(
                            getUniqClicks(clicksData?.allData ?? [], productId),
                            count,
                        ),
                        [ProductTableKeys.BTR]: getBuyThroughRate(
                            btrData?.allData ?? [],
                            productId,
                        ),
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
                        url: buildProductUrl(
                            product?.handle,
                            shopDomainByIntegrationId.get(
                                integrationByProductId.get(productId) ?? 0,
                            ),
                        ),
                    },
                }
            })
        }, [
            productIds,
            allProducts,
            clicksData,
            btrData,
            totalRecommendedById,
            shopDomainByIntegrationId,
            integrationByProductId,
        ])

        const productsIsFetching = productsQueries.some((q) => q.isFetching)
        const productsIsError = productsQueries.some((q) => q.isError)

        const isMetricsFetching =
            isRecommendationsFetching || isClicksFetching || isBtrFetching
        const isMetricsError =
            isRecommendationsError || isClicksError || isBtrError

        const transformed = useMemo(
            () => transformShoppingAssistantTopProducts(data),
            [data],
        )

        return {
            ...transformed,
            isFetching: isMetricsFetching || productsIsFetching,
            isError: isMetricsError || productsIsError,
        }
    }

export const fetchShoppingAssistantTopProductsData = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const periodFilters: StatsFilters = { period: statsFilters.period }
    const fileName = getCsvFileNameWithDates(
        periodFilters.period,
        'shopping-assistant-top-products',
    )

    const [recommendationsResult, clicksResult, btrResult] = await Promise.all([
        fetchTimesRecommendedPerProduct(periodFilters, timezone),
        fetchProductClicksPerProduct(periodFilters, timezone),
        fetchBuyThroughRatePerProduct(periodFilters, timezone),
    ])

    const { productsByIntegration, productIds, totalRecommendedById } =
        buildProductsFromRecommendations(
            recommendationsResult.data?.allData ?? [],
        )

    if (!productIds.length) {
        return { fileName, files: { [fileName]: '' } }
    }

    const productResults = await Promise.all(
        productsByIntegration.map(({ integrationId, productIds: ids }) =>
            fetchIntegrationProducts(integrationId, ids).then((results) =>
                results.map((r) => r.toJS() as Product),
            ),
        ),
    )

    const allProducts = new Map<number, Product>()
    productResults
        .flat()
        .forEach((product) => allProducts.set(Number(product.id), product))

    const rows: ProductTableContentCell[] = productIds.map((productId) => {
        const product = allProducts.get(productId)
        const countPerProduct = totalRecommendedById[productId]
        return {
            metrics: {
                [ProductTableKeys.NumberOfRecommendations]:
                    countPerProduct ?? 0,
                [ProductTableKeys.CTR]: safeDivide(
                    getUniqClicks(clicksResult.data?.allData ?? [], productId),
                    countPerProduct,
                ),
                [ProductTableKeys.BTR]: getBuyThroughRate(
                    btrResult.data?.allData ?? [],
                    productId,
                ),
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
        }
    })

    const headers = [
        'Product name',
        ...SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS.map((col) => col.label),
    ]
    const csvRows = rows.map((row) => [
        row.product.title,
        ...SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS.map((col) =>
            formatMetricValue(
                row.metrics[col.accessorKey as ProductTableKeys] as number,
                col.metricFormat,
            ),
        ),
    ])

    return {
        fileName,
        files: { [fileName]: createCsv([headers, ...csvRows]) },
    }
}

export const fetchShoppingAssistantTopProductsAsConfigurableTable: ConfigurableGraphFetch =
    async (_savedMeasure, _savedDimension, filters, timezone) => {
        const { files } = await fetchShoppingAssistantTopProductsData(
            filters,
            timezone,
        )
        return { files }
    }
