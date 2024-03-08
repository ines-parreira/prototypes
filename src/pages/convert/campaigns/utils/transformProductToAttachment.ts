import {CampaignProduct} from '../types/CampaignProduct'

import {attachUtmToCampaignProduct} from './attachUtmParams'

export function transformProductToAttachment(
    product: CampaignProduct,
    context: {
        campaignName: string
        currency?: string
    },
    isConvertSubscriber: boolean
) {
    return {
        contentType: 'application/productCard',
        url: product.featured_image,
        name: product.title,
        size: 0,
        extra: {
            price: product.price,
            currency: product?.currency ?? context.currency ?? 'USD',
            product_id: product.id,
            product_link: attachUtmToCampaignProduct(
                product,
                context.campaignName,
                isConvertSubscriber
            ),
            variant_name: product?.variant_name,
            position: product?.position,
        },
    }
}
