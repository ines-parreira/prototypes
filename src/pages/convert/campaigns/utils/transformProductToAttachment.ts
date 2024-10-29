import {AttachmentEnum} from 'common/types'

import {CampaignAttachment} from '../types/CampaignAttachment'
import {CampaignProduct} from '../types/CampaignProduct'

import {attachUtmToCampaignProduct} from './attachUtmParams'

export function transformProductToAttachment(
    product: CampaignProduct,
    context: {
        campaignName: string
        currency?: string
    },
    isConvertSubscriber: boolean,
    utmEnabled: boolean = true,
    utmQueryString: string = ''
): CampaignAttachment {
    return {
        contentType: AttachmentEnum.Product,
        url: product.featured_image,
        name: product.title,
        size: 0,
        extra: {
            price: product.price,
            compare_at_price: product.compareAtPrice,
            currency: product?.currency ?? context.currency ?? 'USD',
            product_id: product.id,
            product_link: attachUtmToCampaignProduct(
                product,
                context.campaignName,
                isConvertSubscriber,
                utmEnabled,
                utmQueryString
            ),
            variant_name: product?.variant_name,
            position: product?.position,
        },
    }
}
