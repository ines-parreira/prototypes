import { useQuery } from '@tanstack/react-query'

type TagsType = 'customers' | 'orders'

const RESPONSE_KEYS: Record<TagsType, string> = {
    customers: 'customerTags',
    orders: 'orderTags',
}

type ShopifyTagsResponse = {
    data?: {
        shop?: Record<string, { edges?: Array<{ node: string }> }>
    }
}

type UseShopifyShopTagsParams = {
    integrationId: number | undefined
    tagsType?: TagsType
}

async function fetchShopifyShopTags(
    integrationId: number,
    tagsType: TagsType,
): Promise<string[]> {
    const url = `/integrations/shopify/shop-tags/${tagsType}/list/?integration_id=${integrationId}&tags_type=${tagsType}`

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

    const data: ShopifyTagsResponse = await response.json()
    const responseKey = RESPONSE_KEYS[tagsType]
    const edges = data?.data?.shop?.[responseKey]?.edges ?? []

    return edges.map((edge) => edge.node)
}

export function useShopifyShopTags({
    integrationId,
    tagsType = 'customers',
}: UseShopifyShopTagsParams) {
    return useQuery({
        queryKey: ['shopify', 'shopTags', tagsType, integrationId],
        queryFn: () => fetchShopifyShopTags(integrationId!, tagsType),
        enabled: !!integrationId,
        staleTime: 5 * 60 * 1000,
    })
}
