import {Map} from 'immutable'
import {IntegrationDataItem} from 'models/integration/types'
import {ShopifyProductCardContentType} from 'constants/integrations/shopify'
import {Product} from 'constants/integrations/types/shopify'
import {getIconFromUrl} from 'utils'
import {CampaignAttachment} from 'pages/convert/campaigns/types/CampaignAttachment'

export const transformProductToCampaignAttachment = (
    result: IntegrationDataItem<Product>,
    shopifyIntegration: Map<string, any>
): CampaignAttachment => {
    const shopifyPlaceholderImage = 'integrations/shopify-placeholder.png'
    const shopDomain = shopifyIntegration.getIn([
        'meta',
        'shop_domain',
    ]) as string
    const handle = result.data?.handle || ''

    return {
        url: result.data?.image?.src || getIconFromUrl(shopifyPlaceholderImage),
        name: result.data?.title,
        contentType: ShopifyProductCardContentType,
        size: 0,
        extra: {
            price: parseFloat(result.data?.variants[0].price),
            currency: shopifyIntegration.getIn(['meta', 'currency']) ?? 'USD',
            product_link: `https://${shopDomain}/products/${handle}`,
            product_id: result.data?.id,
        },
    }
}
