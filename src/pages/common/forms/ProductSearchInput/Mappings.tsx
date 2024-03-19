import {
    IntegrationType,
    IntegrationDataItem,
    BigCommerceProductVariant,
    BigCommerceProduct,
} from 'models/integration/types'
import {
    Product as ShopifyProduct,
    Variant as ShopifyVariant,
} from 'constants/integrations/types/shopify'

import {supportedBigCommerceModifierTypes} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/components/modifiers-popover/consts'
import {Props as ResultProps} from './Result'

export const shopifyDataMappers = {
    variantsPath: (integrationItem: IntegrationDataItem<ShopifyProduct>) =>
        integrationItem.data.variants,
    product: (
        integrationItem: IntegrationDataItem<ShopifyProduct>
    ): ResultProps => {
        const product = integrationItem.data
        const variant = product.variants[0]
        const sku = variant.sku ? `SKU: ${variant.sku}` : null
        const isTracked = product.variants.every(
            (variant) => !!variant.inventory_management
        )
        const quantity = product.variants.reduce(
            (total, variant) => total + variant.inventory_quantity,
            0
        )

        return {
            image: {
                alt: product.image?.alt || product.title,
                src: product.image?.src,
                type: IntegrationType.Shopify,
            },
            title: product.title,
            subtitle:
                product.variants.length > 1
                    ? `${product.variants.length} variants`
                    : sku,
            stock: {
                isAvailable: isTracked ? quantity > 0 : true,
                tracked: isTracked,
                quantity: quantity,
                totalVariants: product.variants.length,
            },
        }
    },
    variants: (
        integrationItem: IntegrationDataItem<ShopifyProduct>,
        variant: ShopifyVariant
    ): ResultProps => {
        const product = integrationItem.data
        const title =
            product.variants.length > 1 && variant.title
                ? `${product.title} - ${variant.title}`
                : product.title
        const image =
            product.images &&
            product.images.find((image) => image.id === variant.image_id)
        const isTracked = !!variant.inventory_management
        const quantity = variant.inventory_quantity

        return {
            image: {
                alt: image?.alt || product.image?.alt || product.title,
                src: image?.src || product.image?.src,
                type: IntegrationType.Shopify,
            },
            title,
            subtitle: variant.sku ? `SKU: ${variant.sku}` : null,
            stock: {
                isAvailable: isTracked ? quantity > 0 : true,
                tracked: isTracked,
                quantity: quantity,
            },
        }
    },
}

export const bigcommerceDataMappers = {
    variantsPath: (integrationItem: IntegrationDataItem<BigCommerceProduct>) =>
        integrationItem.data.variants,
    product: (
        integrationItem: IntegrationDataItem<BigCommerceProduct>
    ): ResultProps => {
        const product = integrationItem.data
        const image = {src: product.image_url, alt: product.name} as const
        const isDisabled = (product.modifiers ?? []).some(
            ({type}) => !supportedBigCommerceModifierTypes.includes(type)
        )

        return {
            image: image,
            title: product.name,
            subtitle: product.sku
                ? `SKU: ${product.sku}`
                : product.variants.length > 1
                ? `${product.variants.length} variants`
                : '',
            stock: {
                tracked: ['variant', 'product'].includes(
                    product.inventory_tracking
                ),
                quantity: product.inventory_level,
                totalVariants: product.variants ? product.variants.length : 0,
            },
            disabled: isDisabled,
            disabledReason: isDisabled
                ? 'Product cannot be added due to unsupported modifiers.'
                : undefined,
        }
    },
    variants: (
        integrationItem: IntegrationDataItem<BigCommerceProduct>,
        variant: BigCommerceProductVariant
    ): ResultProps => {
        const product = integrationItem.data
        const image_url = variant.image_url
            ? variant.image_url
            : product.image_url
        const image = {src: image_url, alt: ''} as const

        return {
            image,
            title: product.name,
            subtitle: variant.sku ? `SKU: ${variant.sku}` : null,
            stock: {
                tracked: product.inventory_tracking === 'variant',
                quantity: variant.inventory_level,
            },
        }
    },
}
