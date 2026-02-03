import { useQuery } from '@tanstack/react-query'

type ShopifyCustomerTagsResponse = {
    data?: {
        shop?: {
            customerTags?: {
                edges?: Array<{ node: string }>
            }
        }
    }
}

type UseShopifyShopTagsParams = {
    integrationId: number | undefined
}

async function fetchShopifyShopTags(integrationId: number): Promise<string[]> {
    const url = `/integrations/shopify/shop-tags/customers/list/?integration_id=${integrationId}&tags_type=customers`

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch shop tags: ${response.statusText}`)
    }

    const data: ShopifyCustomerTagsResponse = await response.json()
    const edges = data?.data?.shop?.customerTags?.edges ?? []

    return edges.map((edge) => edge.node)
}

export function useShopifyShopTags({
    integrationId,
}: UseShopifyShopTagsParams) {
    return useQuery({
        queryKey: ['shopify', 'shopTags', 'customers', integrationId],
        queryFn: () => fetchShopifyShopTags(integrationId!),
        enabled: !!integrationId,
        staleTime: 5 * 60 * 1000,
    })
}
