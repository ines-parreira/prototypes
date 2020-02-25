import React from 'react'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../../constants/integration'
import type {IntegrationDataItem} from '../../../../models/integration'
import * as Shopify from '../../../../constants/integrations/shopify'
import type {SearchInputResultProps} from '../SearchInput'

import Result, {type Props as ResultProps} from './Result'

type Props = SearchInputResultProps<IntegrationDataItem<Shopify.Product>>

export default class ProductResult extends React.PureComponent<Props> {
    static _dataMappers = {
        [SHOPIFY_INTEGRATION_TYPE]: ProductResult._shopifyDataMapper,
    }

    static _shopifyDataMapper(product: Shopify.Product): ResultProps {
        const variant = product.variants[0]
        const sku = variant.sku ? `SKU: ${variant.sku}` : null

        return {
            image: product.image,
            title: product.title,
            subtitle: product.variants.length > 1
                ? `${product.variants.length} variants`
                : sku,
        }
    }

    render() {
        const {result: item} = this.props
        const {data: product} = item
        const integrationType = item.integration_type
        const dataMapper = ProductResult._dataMappers[integrationType]
        const resultProps = dataMapper ? dataMapper(product) : null

        return <Result {...resultProps} />
    }
}
