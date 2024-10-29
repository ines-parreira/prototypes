import {Map} from 'immutable'

import {AttachmentEnum} from 'common/types'
import {Product} from 'constants/integrations/types/shopify'
import {IntegrationDataItem} from 'models/integration/types'
import {CampaignAttachment} from 'pages/convert/campaigns/types/CampaignAttachment'
import {getIconFromUrl} from 'utils'

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
    const firstVariant = result.data?.variants[0]

    return {
        url: result.data?.image?.src || getIconFromUrl(shopifyPlaceholderImage),
        name: result.data?.title,
        contentType: AttachmentEnum.Product,
        size: 0,
        extra: {
            price: parseFloat(firstVariant.price),
            compare_at_price: firstVariant?.compare_at_price
                ? parseFloat(firstVariant.compare_at_price)
                : undefined,
            currency: shopifyIntegration.getIn(['meta', 'currency']) ?? 'USD',
            product_link: `https://${shopDomain}/products/${handle}`,
            product_id: result.data?.id,
        },
    }
}
