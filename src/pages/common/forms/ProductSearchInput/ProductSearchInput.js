// @flow

import React from 'react'
import PropTypes from 'prop-types'
import _noop from 'lodash/noop'

import SearchInput from '../SearchInput'
import {INTEGRATION_DATA_ITEM_TYPE_PRODUCT, SHOPIFY_INTEGRATION_TYPE} from '../../../../constants/integration'
import type {IntegrationDataItem, Product, Variant} from '../../../../models/integration'
import * as Shopify from '../../../../constants/integrations/shopify'

import ProductResult from './ProductResult'
import VariantResult from './VariantResult'

type Props = {
    className?: string,
    autoFocus?: boolean,
    searchOnFocus?: boolean,
    onVariantClicked: (item: IntegrationDataItem<Product>, variant: Variant) => void,
}

export default class ProductSearchInput extends React.PureComponent<Props> {
    static defaultProps = {
        autoFocus: true,
        searchOnFocus: false,
        onVariantClicked: _noop,
    }

    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    static _variantsMapper = {
        [SHOPIFY_INTEGRATION_TYPE]: (result: IntegrationDataItem<Shopify.Product>) => result.data.variants,
    }

    onProductClicked = (item: IntegrationDataItem<Product>): Array<Variant> => {
        const {integration_type: integrationType} = item
        const variantsMapper = ProductSearchInput._variantsMapper[(integrationType: any)]
        const variants = variantsMapper ? variantsMapper(item) : []

        if (variants.length === 1) {
            this.onVariantClicked(item, variants[0])
        }

        return variants.length > 1 ? variants : []
    }

    onVariantClicked = (item: IntegrationDataItem<Product>, variant: Variant) => {
        const {onVariantClicked} = this.props
        onVariantClicked(item, variant)
    }

    render() {
        const {className, autoFocus, searchOnFocus} = this.props
        const {integrationId} = this.context

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
