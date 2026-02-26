import { useQuery } from '@tanstack/react-query'

type ShopifyOrderTagsResponse = {
    data?: {
        shop?: {
            orderTags?: {
                edges?: Array<{ node: string }>
            }
        }
    }
}

type UseShopifyOrderShopTagsParams = {
    integrationId: number | undefined
}

async function fetchShopifyOrderShopTags(
    integrationId: number,
): Promise<string[]> {
    const url = `/integrations/shopify/shop-tags/orders/list/?integration_id=${integrationId}&tags_type=orders`

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(
            `Failed to fetch order shop tags: ${response.statusText}`,
        )
    }

    const data: ShopifyOrderTagsResponse = await response.json()
    const edges = data?.data?.shop?.orderTags?.edges ?? []

    return edges.map((edge) => edge.node)
}

export function useShopifyOrderShopTags({
    integrationId,
}: UseShopifyOrderShopTagsParams) {
    return useQuery({
        queryKey: ['shopify', 'shopTags', 'orders', integrationId],
        queryFn: () => fetchShopifyOrderShopTags(integrationId!),
        enabled: !!integrationId,
        staleTime: 5 * 60 * 1000,
    })
}
