import {Map, fromJS} from 'immutable'
import {IntegrationDataItem, ProductCardDetails} from 'models/integration/types'
import {Product} from 'constants/integrations/types/shopify'
import {getIconFromUrl} from 'utils'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {AttachmentEnum} from 'common/types'
import {TooltipTourConfigurationType} from './types'

export const getTooltipTourConfiguration = (
    action: string,
    configuration: Record<string, TooltipTourConfigurationType> | undefined
) => {
    if (!configuration || !(action in configuration)) {
        return undefined
    }

    return {
        text: configuration[action]?.tooltipContent,
    }
}

export const mapIntegrationToPickedShopifyIntegration = (
    integration: Map<any, any>
) => {
    return fromJS({
        id: integration.get('id'),
        name: integration.get('name'),
        shop_domain: integration.getIn(['meta', 'shop_domain']),
        currency: integration.getIn(['meta', 'currency']),
    }) as Map<any, any>
}

export const transformShopifyProductToProductCardDetails = (
    product: IntegrationDataItem<Product>,
    shopifyIntegration: Map<string, string>,
    shouldSetVariantTitle: boolean = true,
    placeholderImage: string = 'integrations/shopify-placeholder.png'
): ProductCardDetails => {
    return {
        imageUrl: product?.data?.image?.src || getIconFromUrl(placeholderImage),
        price: product?.data?.variants[0].price,
        currency: shopifyIntegration.get('currency'),
        link: `https://${shopifyIntegration.get('shop_domain')}/products/${
            product?.data?.handle || ''
        }`,
        productTitle: product?.data?.title,
        productId: product?.data?.id,
        variantId: product?.data?.variants?.[0]?.id,
        variantTitle: shouldSetVariantTitle ? product?.data?.title : undefined,
    }
}

export const transformProductCardDetailsToProductCardAttachment = (
    productDetails: ProductCardDetails
): ProductCardAttachment => {
    return {
        content_type: AttachmentEnum.Product,
        name: productDetails.productTitle,
        size: 0,
        url: productDetails.imageUrl,
        extra: {
            product_id: productDetails.productId,
            variant_id: productDetails.variantId,
            price: productDetails.price,
            variant_name: productDetails.variantTitle,
            product_link: productDetails.link,
            currency: productDetails.currency,
            featured_image: productDetails.imageUrl,
        },
    }
}
