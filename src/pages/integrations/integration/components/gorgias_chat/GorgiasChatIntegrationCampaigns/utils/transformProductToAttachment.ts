import {CampaignProduct} from '../types/CampaignProduct'

import {attachUtmToCampaignProduct} from './attachUtmParams'

export function transformProductToAttachment(
    product: CampaignProduct,
    context: {
        campaignName: string
    }
) {
    return {
        contentType: 'application/productCard',
        url: product.featured_image,
        name: product.title,
        size: 0,
        extra: {
            price: product.price,
            currency: product?.currency,
            product_id: product.id,
            product_link: attachUtmToCampaignProduct(
                product,
                context.campaignName
            ),
            variant_name: product?.variant_name,
        },
    }
}
