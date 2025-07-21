import { Map } from 'immutable'

import { AttachmentEnum } from 'common/types'
import { Product } from 'constants/integrations/types/shopify'
import { IntegrationDataItem } from 'models/integration/types'
import { CampaignAttachment } from 'pages/convert/campaigns/types/CampaignAttachment'
import { getIconFromUrl } from 'utils'
import { findCheapestProductVariant } from 'utils/findCheapestProductVariant'

export const transformProductToCampaignAttachment = (
    result: IntegrationDataItem<Product>,
    shopifyIntegration: Map<string, any>,
): CampaignAttachment => {
    const shopifyPlaceholderImage = 'integrations/shopify-placeholder.png'
    const shopDomain = shopifyIntegration.getIn([
        'meta',
        'shop_domain',
    ]) as string
    const handle = result.data?.handle || ''
    const cheapestVariant = findCheapestProductVariant(result.data)

    return {
        url: result.data?.image?.src || getIconFromUrl(shopifyPlaceholderImage),
        name: result.data?.title,
        contentType: AttachmentEnum.Product,
        size: 0,
        extra: {
            price: parseFloat(cheapestVariant.price),
            compare_at_price: cheapestVariant.compare_at_price
                ? parseFloat(cheapestVariant.compare_at_price)
                : undefined,
            currency: shopifyIntegration.getIn(['meta', 'currency']) ?? 'USD',
            product_link: `https://${shopDomain}/products/${handle}`,
            product_id: result.data?.id,
        },
    }
}
