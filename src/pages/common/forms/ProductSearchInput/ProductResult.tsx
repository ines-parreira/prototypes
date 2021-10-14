import React, {Component} from 'react'

import {
    IntegrationDataItem,
    IntegrationType,
} from '../../../../models/integration/types'
import {Product} from '../../../../constants/integrations/types/shopify'
import {SearchInputResultProps} from '../SearchInput/types'

import Result, {Props as ResultProps} from './Result'

type Props = SearchInputResultProps<IntegrationDataItem<Product>>

export default class ProductResult extends Component<Props> {
    public static _shopifyDataMapper = function (
        product: Product
    ): ResultProps {
        const variant = product.variants[0]
        const sku = variant.sku ? `SKU: ${variant.sku}` : null

        return {
            image: product.image,
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
    }

    static _dataMappers = {
        [IntegrationType.Shopify]:
            // eslint-disable-next-line @typescript-eslint/unbound-method
            ProductResult._shopifyDataMapper,
    }

    render() {
        const {result: item} = this.props
        const {data: product} = item
        const integrationType = item.integration_type
        const dataMapper =
            ProductResult._dataMappers[
                integrationType as keyof typeof ProductResult._dataMappers
            ]
        const resultProps = dataMapper ? dataMapper(product) : null

        return <Result {...resultProps!} />
    }
}
