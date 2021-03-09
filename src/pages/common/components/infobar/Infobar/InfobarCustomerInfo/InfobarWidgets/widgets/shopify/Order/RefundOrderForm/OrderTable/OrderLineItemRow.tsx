import React, {ChangeEvent} from 'react'
import {Button, Input, InputGroup, InputGroupAddon} from 'reactstrap'
import {Map, List} from 'immutable'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'

import {
    getOrderLineItemDiscountedPrice,
    getOrderLineItemPrice,
} from '../../../../../../../../../../../../business/shopify/lineItem'
import {formatPrice} from '../../../../../../../../../../../../business/shopify/number'
import MoneyAmount from '../../../../MoneyAmount'

import css from './OrderLineItemRow.less'

type Props = {
    lineItem: Map<any, any>
    refund: Map<any, any> | null
    shopName: string
    currencyCode: string
    shopCurrencyCode: string
    onChange: (value: Map<any, any>) => void
}

type State = {
    quantity: number
    restockable: null | boolean
}

export class OrderLineItemRow extends React.PureComponent<Props, State> {
    state = {
        quantity: this.props.lineItem.get('quantity') as number,
        restockable: null,
    }

    _maxQuantity = this.props.lineItem.get('quantity')

    static getDerivedStateFromProps({refund, lineItem}: Props, state: State) {
        // When we receive the "suggested refund" for the first time
        if (!!refund && !refund.isEmpty() && state.restockable === null) {
            const refundLineItem = (refund.get('refund_line_items', []) as List<
                any
            >).find(
                (refundLineItem: Map<any, any>) =>
                    refundLineItem.get('line_item_id') === lineItem.get('id')
            ) as Map<any, any>

            return {
                ...state,
                restockable: refundLineItem
                    ? !!refundLineItem.get('location_id')
                    : true,
            }
        }

        return null
    }

    _onQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value)
        let quantity = isNaN(value) ? 0 : value

        if (quantity < 0) {
            quantity = 0
        } else if (quantity > this._maxQuantity) {
            quantity = this._maxQuantity
        }

        this.setState({quantity})
        this._updateLineItem()
    }

    _onQuantityUp = () => {
        const {quantity} = this.state
        const newQuantity = quantity + 1

        this.setState({quantity: newQuantity})
        this._updateLineItem()
    }

    _onQuantityDown = () => {
        const {quantity} = this.state
        const newQuantity = quantity - 1

        this.setState({quantity: newQuantity})
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
        const productId = lineItem.get('product_id') as number | undefined
        if (!productId) {
            return (
                <div>
                    <span className={css.title}>{lineItem.get('title')}</span>
                </div>
            )
        }

        const href = `https://${shopName}.myshopify.com/admin/products/${productId}`
        const variantId = lineItem.get('variant_id') as number | undefined

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
        const {restockable} = this.state
        const variantTitle = lineItem.get('variant_title')
        const shouldRenderVariantTitle =
            !!variantTitle && variantTitle !== 'Default Title'
        const sku = lineItem.get('sku')
        const cannotRestock = restockable === false

        return (
            <td className={css.container}>
                <div className={css.legend}>
                    {this._renderTitle()}
                    {shouldRenderVariantTitle && (
                        <div className={css.subtitle}>{variantTitle}</div>
                    )}
                    {!!sku && <div className={css.subtitle}>SKU: {sku}</div>}
                    {cannotRestock && (
                        <div className="text-danger">
                            This product can't be restocked.
                        </div>
                    )}
                </div>
            </td>
        )
    }

    _renderPrice() {
        const {lineItem, shopCurrencyCode} = this.props

        if (this._maxQuantity === 0) {
            return (
                <td colSpan={2} className="text-center text-muted">
                    <small>Already returned</small>
                </td>
            )
        }

        const price = getOrderLineItemPrice(lineItem, shopCurrencyCode)
        const discountedPrice = getOrderLineItemDiscountedPrice(
            lineItem,
            shopCurrencyCode,
            this._maxQuantity
        )
        const formattedDiscountedPrice = formatPrice(
            discountedPrice,
            shopCurrencyCode
        )
        const hasDiscount = price !== formattedDiscountedPrice

        return (
            <td className={css.numberCol}>
                <div className="d-flex">
                    <div className="d-inline-block text-center">
                        {hasDiscount && (
                            <small className="d-block text-muted">
                                <del>
                                    <MoneyAmount
                                        renderIfZero
                                        amount={price}
                                        currencyCode={shopCurrencyCode}
                                    />
                                </del>
                            </small>
                        )}
                        <MoneyAmount
                            renderIfZero
                            amount={formattedDiscountedPrice}
                            currencyCode={shopCurrencyCode}
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
                <InputGroup>
                    <span className={css.quantityContainer}>
                        <Input
                            pattern="\d+"
                            value={quantity}
                            className={css.quantityInput}
                            onChange={this._onQuantityChange}
                        />
                        <span className={css.quantityMax}>
                            / {this._maxQuantity}
                        </span>
                    </span>
                    <InputGroupAddon
                        addonType="append"
                        className={css.quantityButtonsContainer}
                    >
                        <Button
                            type="button"
                            tabIndex={0}
                            className={classnames(
                                css.focusable,
                                css.quantityBtn,
                                css.quantityBtnUp
                            )}
                            disabled={quantity === this._maxQuantity}
                            onClick={this._onQuantityUp}
                        >
                            &#9650;
                        </Button>
                        <Button
                            type="button"
                            tabIndex={0}
                            className={classnames(
                                css.focusable,
                                css.quantityBtn,
                                css.quantityBtnDown
                            )}
                            disabled={quantity === 0}
                            onClick={this._onQuantityDown}
                        >
                            &#9660;
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </td>
        )
    }

    _renderTotal() {
        const {lineItem, currencyCode} = this.props
        const {quantity} = this.state
        const discountedPrice = getOrderLineItemDiscountedPrice(
            lineItem,
            currencyCode,
            this._maxQuantity
        )
        const total = discountedPrice * quantity

        return (
            <td className={css.numberCol}>
                <div className="d-flex">
                    <strong className={classnames('mt-auto mb-auto ml-auto')}>
                        <MoneyAmount
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
