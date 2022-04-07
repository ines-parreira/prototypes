import {
    ShopifyOrderTags,
    ShopifyCustomerTags,
    ShopifyTags,
} from 'models/integration/types'
import client from '../../api/resources'

export const fetchShopTags = async (
    integrationId: number,
    tagsType: ShopifyTags
): Promise<string[]> => {
    const url = `/integrations/shopify/shop-tags/${tagsType}/list/`

    let tags: Record<string, string>[] = []

    const response = await client.get(url, {
        params: {integration_id: integrationId, tags_type: tagsType},
    })
    if (tagsType === ShopifyTags.orders) {
        const responseData: ShopifyOrderTags = response.data
        tags = responseData?.data?.shop?.orderTags?.edges || []
    } else if (tagsType === ShopifyTags.customers) {
        const responseData: ShopifyCustomerTags = response.data
        tags = responseData?.data?.shop?.customerTags?.edges || []
    }

    return tags?.reduce((acc: string[], tag: Record<string, string>) => {
        if ('node' in tag) {
            acc.push(tag['node'])
        }
        return acc
    }, [])
}
