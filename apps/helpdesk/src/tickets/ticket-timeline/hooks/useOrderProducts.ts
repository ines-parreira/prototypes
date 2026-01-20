import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import type { Order, Product } from 'constants/integrations/types/shopify'
import type { Customer } from 'models/customer/types'
import { IntegrationType } from 'models/integration/constants'
import { fetchIntegrationProducts } from 'state/integrations/helpers'

/**
 * Hook to fetch product data for orders
 * Extracts unique product IDs from orders and fetches them from all Shopify integrations
 */
export function useOrderProducts(
    customer: Customer | undefined,
    orders: Order[],
) {
    // Get all Shopify integration IDs from customer
    const shopifyIntegrationIds = useMemo(() => {
        if (!customer?.integrations) return []

        const integrationIds: number[] = []

        Object.entries(customer.integrations).forEach(
            ([integrationId, integration]) => {
                if (
                    integration.__integration_type__ === IntegrationType.Shopify
                ) {
                    integrationIds.push(parseInt(integrationId, 10))
                }
            },
        )

        return integrationIds
    }, [customer])

    // Extract unique product IDs from all orders
    const productIds = useMemo(() => {
        const ids = new Set<number>()

        orders.forEach((order) => {
            order.line_items.forEach((lineItem) => {
                // Only fetch products that still exist in Shopify
                if (lineItem.product_id && lineItem.product_exists) {
                    ids.add(lineItem.product_id)
                }
            })
        })

        return Array.from(ids)
    }, [orders])

    // Fetch products from all Shopify integrations
    const enabled = shopifyIntegrationIds.length > 0 && productIds.length > 0

    const {
        data: products,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['shopify-products', shopifyIntegrationIds, productIds],
        queryFn: async () => {
            if (shopifyIntegrationIds.length === 0) {
                return []
            }

            // Fetch products from all Shopify integrations in parallel
            const allProductsPromises = shopifyIntegrationIds.map(
                (integrationId) =>
                    fetchIntegrationProducts(integrationId, productIds),
            )

            const allProductsArrays = await Promise.all(allProductsPromises)

            // Flatten and deduplicate products from all integrations
            const productsMap = new Map<number, Product>()

            allProductsArrays.forEach((productsData) => {
                productsData.forEach((productMap) => {
                    const product = productMap.toJS() as Product
                    // Use product ID as key to avoid duplicates
                    if (product?.id) {
                        productsMap.set(product.id, product)
                    }
                })
            })

            return Array.from(productsMap.values())
        },
        enabled,
        staleTime: Infinity,
    })

    // Create a map for easy lookup: product_id -> Product
    const productsMap = useMemo(() => {
        const map = new Map<number, Product>()
        if (products && Array.isArray(products)) {
            products.forEach((product) => {
                if (product?.id) {
                    map.set(product.id, product)
                }
            })
        }
        return map
    }, [products])

    return {
        products: productsMap,
        isLoading,
        isError,
        hasShopifyIntegration: shopifyIntegrationIds.length > 0,
    }
}
