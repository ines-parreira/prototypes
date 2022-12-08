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
                tracked: product.variants.every(
                    (variant) => !!variant.inventory_management
                ),
                quantity: product.variants.reduce(
                    (total, variant) => total + variant.inventory_quantity,
                    0
                ),
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

        return {
            image: {
                alt: image?.alt || product.image?.alt || product.title,
                src: image?.src || product.image?.src,
                type: IntegrationType.Shopify,
            },
            title,
            subtitle: variant.sku ? `SKU: ${variant.sku}` : null,
            stock: {
                tracked: !!variant.inventory_management,
                quantity: variant.inventory_quantity,
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
        return {
            image: image,
            title: product.name,
            subtitle: product.sku,
            stock: {
                tracked: true,
                quantity: product.inventory_level,
                totalVariants: product.variants ? product.variants.length : 0,
            },
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
                tracked: true,
                quantity: variant.inventory_level,
            },
        }
    },
}
