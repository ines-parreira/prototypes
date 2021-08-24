import React, {Component} from 'react'

import {
    IntegrationDataItem,
    IntegrationType,
    Product,
    Variant,
} from '../../../../models/integration/types'
import {Product as ShopifyProduct} from '../../../../constants/integrations/types/shopify'
import {SearchInputSubResultProps} from '../SearchInput/types'

import Result, {Props as ResultProps} from './Result'

type Props = SearchInputSubResultProps<IntegrationDataItem<Product>, Variant>

export default class VariantResult extends Component<Props> {
    public static _shopifyDataMapper = function (
        product: ShopifyProduct,
        variant: Variant
    ): ResultProps {
        const title =
            product.variants.length > 1 && variant.title
                ? `${product.title} - ${variant.title}`
                : product.title

        const image =
            variant.image_id && product.images
                ? product.images.find((image) => image.id === variant.image_id)
                : product.image

        return {
            image,
            title,
            subtitle: variant.sku ? `SKU: ${variant.sku}` : null,
            stock: {
                tracked: !!variant.inventory_management,
                quantity: variant.inventory_quantity,
            },
        }
    }

    static _dataMappers = {
        [IntegrationType.ShopifyIntegrationType]:
            // eslint-disable-next-line @typescript-eslint/unbound-method
            VariantResult._shopifyDataMapper,
    }

    render() {
        const {result: item, subResult: variant} = this.props
        const {data: product} = item
        const integrationType = item.integration_type
        const dataMapper =
            VariantResult._dataMappers[
                integrationType as keyof typeof VariantResult._dataMappers
            ]
        const resultProps = dataMapper ? dataMapper(product, variant) : null

        return <Result {...resultProps!} />
    }
}
