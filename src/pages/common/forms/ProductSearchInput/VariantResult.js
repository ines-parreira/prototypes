import React from 'react'

import type {
    IntegrationDataItem,
    Product,
    Variant,
} from '../../../../models/integration'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../constants/integration.ts'
import type {
    Product as ShopifyProduct,
    Variant as ShopifyVariant,
} from '../../../../constants/integrations/types/shopify'
import type {SearchInputSubResultProps} from '../SearchInput'

import Result, {type Props as ResultProps} from './Result'

type Props = SearchInputSubResultProps<IntegrationDataItem<Product>, Variant>

export default class VariantResult extends React.PureComponent<Props> {
    static _dataMappers = {
        [SHOPIFY_INTEGRATION_TYPE]: VariantResult._shopifyDataMapper,
    }

    static _shopifyDataMapper(
        product: ShopifyProduct,
        variant: ShopifyVariant
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
        }
    }

    render() {
        const {result: item, subResult: variant} = this.props
        const {data: product} = item
        const integrationType = item.integration_type
        const dataMapper = VariantResult._dataMappers[integrationType]
        const resultProps = dataMapper ? dataMapper(product, variant) : null

        return <Result {...resultProps} />
    }
}
