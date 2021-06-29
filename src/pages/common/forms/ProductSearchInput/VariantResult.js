// @flow
import React from 'react'

import type {
    IntegrationDataItem,
    Product,
    Variant,
} from '../../../../models/integration'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../constants/integration.ts'
import type {Product as ShopifyProduct} from '../../../../constants/integrations/types/shopify'
import type {SearchInputSubResultProps} from '../SearchInput'

import Result, {type Props as ResultProps} from './Result'

type Props = SearchInputSubResultProps<IntegrationDataItem<Product>, Variant>

export default class VariantResult extends React.PureComponent<Props> {
    static _dataMappers = {
        [SHOPIFY_INTEGRATION_TYPE]: VariantResult._shopifyDataMapper,
    }

    static _shopifyDataMapper(
        product: ShopifyProduct,
        // $TsFixMe replace any type to Variant
        variant: any
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
            // $FlowFixMe
            image,
            title,
            subtitle: variant.sku ? `SKU: ${variant.sku}` : null,
            stock: {
                tracked: !!variant.inventory_management,
                quantity: variant.inventory_quantity,
            },
        }
    }

    render() {
        const {result: item, subResult: variant} = this.props
        const {data: product} = item
        const integrationType = item.integration_type
        const dataMapper = VariantResult._dataMappers[integrationType]
        const resultProps = dataMapper ? dataMapper(product, variant) : null

        // $FlowFixMe
        return <Result {...resultProps} />
    }
}
