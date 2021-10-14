import React, {Component} from 'react'
import PropTypes from 'prop-types'
import _noop from 'lodash/noop'

import SearchInput from '../SearchInput/SearchInput'
import {INTEGRATION_DATA_ITEM_TYPE_PRODUCT} from '../../../../constants/integration'
import {
    IntegrationDataItem,
    IntegrationType,
    Product,
    Variant,
} from '../../../../models/integration/types'
import {Product as ShopifyProduct} from '../../../../constants/integrations/types/shopify'

import ProductResult from './ProductResult'
import VariantResult from './VariantResult'

type Props = {
    className?: string
    autoFocus?: boolean
    searchOnFocus?: boolean
    onVariantClicked: (
        item: IntegrationDataItem<Product>,
        variant: Variant
    ) => void
}

export default class ProductSearchInput extends Component<Props> {
    static defaultProps = {
        autoFocus: true,
        searchOnFocus: false,
        onVariantClicked: _noop,
    }

    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    static _variantsMapper = {
        [IntegrationType.Shopify]: (
            result: IntegrationDataItem<ShopifyProduct>
        ) => result.data.variants,
    }

    onProductClicked = (item: IntegrationDataItem<Product>): Array<Variant> => {
        const {integration_type: integrationType} = item
        const variantsMapper =
            ProductSearchInput._variantsMapper[
                integrationType as keyof typeof ProductSearchInput._variantsMapper
            ]
        const variants = variantsMapper ? variantsMapper(item) : []

        if (variants.length === 1) {
            this.onVariantClicked(item, variants[0])
        }

        return variants.length > 1 ? variants : []
    }

    onVariantClicked = (
        item: IntegrationDataItem<Product>,
        variant: Variant
    ) => {
        const {onVariantClicked} = this.props
        onVariantClicked(item, variant)
    }

    render() {
        const {className, autoFocus, searchOnFocus} = this.props
        const {integrationId} = this.context as {integrationId: number}

        return (
            <SearchInput
                endpoint={`/api/integrations/${integrationId}/${INTEGRATION_DATA_ITEM_TYPE_PRODUCT}/`}
                placeholder="Search products..."
                renderResult={ProductResult}
                renderSubResult={VariantResult}
                className={className}
                autoFocus={autoFocus}
                searchOnFocus={searchOnFocus}
                onResultClicked={this.onProductClicked}
                onSubResultClicked={this.onVariantClicked}
                resultLabel="product"
                resultLabelPlural="products"
                subResultLabel="variant"
                subResultLabelPlural="variants"
            />
        )
    }
}
