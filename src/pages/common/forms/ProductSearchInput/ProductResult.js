// @flow
import React from 'react'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../../constants/integration.ts'
import type {IntegrationDataItem} from '../../../../models/integration'
import type {Product} from '../../../../constants/integrations/types/shopify'
import type {SearchInputResultProps} from '../SearchInput'

import Result, {type Props as ResultProps} from './Result'

type Props = SearchInputResultProps<IntegrationDataItem<Product>>

export default class ProductResult extends React.PureComponent<Props> {
    static _dataMappers = {
        [SHOPIFY_INTEGRATION_TYPE]: ProductResult._shopifyDataMapper,
    }

    static _shopifyDataMapper(product: Product): ResultProps {
        const variant = product.variants[0]
        const sku = variant.sku ? `SKU: ${variant.sku}` : null

        return {
            // $FlowFixMe
            image: product.image,
            title: product.title,
            subtitle:
                product.variants.length > 1
                    ? `${product.variants.length} variants`
                    : sku,
            stock: {
                tracked: product.variants.every(
                    // $FlowFixMe
                    (variant) => !!variant.inventory_management
                ),
                quantity: product.variants.reduce(
                    // $FlowFixMe
                    (total, variant) => total + variant.inventory_quantity,
                    0
                ),
                totalVariants: product.variants.length,
            },
        }
    }

    render() {
        const {result: item} = this.props
        const {data: product} = item
        const integrationType = item.integration_type
        const dataMapper = ProductResult._dataMappers[integrationType]
        const resultProps = dataMapper ? dataMapper(product) : null

        //$FlowFixMe
        return <Result {...resultProps} />
    }
}
