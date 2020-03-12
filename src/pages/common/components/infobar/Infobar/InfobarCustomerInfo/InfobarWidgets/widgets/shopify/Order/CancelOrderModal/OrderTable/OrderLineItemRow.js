// @flow

import React from 'react'
import {Input} from 'reactstrap'
import {type Record} from 'immutable'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'

import {getOrderLineItemDiscountedPrice} from '../../../../../../../../../../../../business/shopify/lineItem'
import * as Shopify from '../../../../../../../../../../../../constants/integrations/shopify'
import {formatPrice} from '../../../../../../../../../../../../business/shopify/number'
import ShopifyMoneyAmount from '../../MoneyAmount'

import css from './OrderLineItemRow.less'

type Props = {
    lineItem: Record<$Shape<Shopify.LineItem>>,
    shopName: string,
    currencyCode: string,
    onChange: (Record<$Shape<Shopify.LineItem>>) => void,
}

type State = {
    quantity: number,
}

export class OrderLineItemRow extends React.PureComponent<Props, State> {
    state = {
        quantity: this.props.lineItem.get('quantity')
    }

    _maxQuantity = this.props.lineItem.get('quantity')

    _onQuantityChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value)
        const quantity = isNaN(value) ? this._maxQuantity : value

        this.setState({quantity})
        this._updateLineItem()
    }

    _updateLineItem = _debounce(() => {
        const {onChange, lineItem} = this.props
        const {quantity} = this.state
        const newLineItem = lineItem.set('quantity', quantity)

        onChange(newLineItem)
    }, 250)

    _renderTitle() {
        const {shopName, lineItem} = this.props
        const productId = lineItem.get('product_id')
        if (!productId) {
            return (
                <div>
                    <span className={css.title}>
                        {lineItem.get('title')}
                    </span>
                </div>
            )
        }

        const href = `https://${shopName}.myshopify.com/admin/products/${productId}`
        const variantId = lineItem.get('variant_id')

        return (
            <div>
                <a
                    className={css.title}
                    href={!!variantId ? `${href}/variants/${variantId}` : href}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {lineItem.get('title')}
                </a>
            </div>
        )
    }

    _renderProduct() {
        const {lineItem} = this.props
        const variantTitle = lineItem.get('variant_title')
        const shouldRenderVariantTitle = !!variantTitle && variantTitle !== 'Default Title'
        const sku = lineItem.get('sku')

        return (
            <td className={css.container}>
                <div className={css.legend}>
                    {this._renderTitle()}
                    {shouldRenderVariantTitle && <div className={css.subtitle}>{variantTitle}</div>}
                    {!!sku && <div className={css.subtitle}>SKU: {sku}</div>}
                </div>
            </td>
        )
    }

    _renderPrice() {
        const {lineItem, currencyCode} = this.props

        if (this._maxQuantity === 0) {
            return (
                <td
                    colSpan={2}
                    className="text-center text-muted"
                >
                    <small>Already returned</small>
                </td>
            )
        }

        const price = lineItem.get('price')
        const discountedPrice = getOrderLineItemDiscountedPrice(lineItem, currencyCode, this._maxQuantity)
        const formattedDiscountedPrice = formatPrice(discountedPrice, currencyCode)
        const hasDiscount = price !== formattedDiscountedPrice

        return (
            <td className={css.numberCol}>
                <div className="d-flex">
                    <div className="d-inline-block text-center">
                        {hasDiscount && (
                            <small className="d-block text-muted">
                                <del>
                                    <ShopifyMoneyAmount
                                        renderIfZero
                                        amount={price}
                                        currencyCode={currencyCode}
                                    />
                                </del>
                            </small>
                        )}
                        <ShopifyMoneyAmount
                            renderIfZero
                            amount={formattedDiscountedPrice}
                            currencyCode={currencyCode}
                        />
                    </div>
                    <span className={css.times}>x</span>
                </div>
            </td>
        )
    }

    _renderQuantity() {
        const {quantity} = this.state

        if (this._maxQuantity === 0) {
            return null
        }

        return (
            <td className={css.quantityCol}>
                <Input
                    type="number"
                    min={0}
                    max={this._maxQuantity}
                    value={quantity}
                    onChange={this._onQuantityChange}
                />
            </td>
        )
    }

    _renderTotal() {
        const {lineItem, currencyCode} = this.props
        const {quantity} = this.state
        const discountedPrice = getOrderLineItemDiscountedPrice(lineItem, currencyCode, this._maxQuantity)
        const total = discountedPrice * quantity

        return (
            <td className={css.numberCol}>
                <div className="d-flex">
                    <strong
                        className={classnames('mt-auto mb-auto ml-auto')}
                    >
                        <ShopifyMoneyAmount
                            renderIfZero
                            amount={formatPrice(total, currencyCode)}
                            currencyCode={currencyCode}
                        />
                    </strong>
                </div>
            </td>
        )
    }

    render() {
        return (
            <tr>
                {this._renderProduct()}
                {this._renderPrice()}
                {this._renderQuantity()}
                {this._renderTotal()}
            </tr>
        )
    }
}
