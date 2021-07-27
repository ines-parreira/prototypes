import React, {ChangeEvent, PureComponent} from 'react'
import {Button, Input, Label, FormGroup} from 'reactstrap'
import {Map, List} from 'immutable'
import {getSizedImageUrl} from '@shopify/theme-images'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'

import {
    getDraftOrderLineItemDiscountedPrice,
    getDraftOrderLineItemTotal,
} from '../../../../../../../../../../../../business/shopify/lineItem'
import defaultImage from '../../../../../../../../../../../../../img/presentationals/shopify-product-default-image.png'
import * as segmentTracker from '../../../../../../../../../../../../store/middlewares/segmentTracker.js'
import {formatPrice} from '../../../../../../../../../../../../business/shopify/number'
import {ProductStockQuantity} from '../../StockQuantity'
import DiscountPopover from '../DiscountPopover/DiscountPopover'
import MoneyAmount from '../../../../MoneyAmount'
import {ShopifyActionType} from '../../../types'

import css from './DraftOrderLineItemRow.less'

type Props = {
    id: string
    actionName: ShopifyActionType
    isShownInEditOrder: boolean
    lineItem: Map<any, any>
    product?: Map<any, any> | null
    shopName: string
    currencyCode: string
    removable: boolean
    onChange: (record: Map<any, any>) => void
    onDelete: () => void
}

type State = {
    quantity: number
    restock: boolean
}

export class DraftOrderLineItemRow extends PureComponent<Props, State> {
    state = {
        quantity: this.props.lineItem.get('quantity'),
        restock: this.props.lineItem.get('restock_item', false),
    }

    _onAppliedDiscountChange = (appliedDiscount: Map<any, any> | null) => {
        const {onChange, lineItem} = this.props
        const newLineItem = lineItem.set('applied_discount', appliedDiscount)
        onChange(newLineItem)
    }

    _onQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {lineItem, isShownInEditOrder} = this.props
        const min = !lineItem.get('newly_added') && isShownInEditOrder ? 0 : 1
        const value = parseInt(event.target.value)
        let quantity = isNaN(value) ? 1 : value
        if (quantity < min) quantity = min
        this.setState({quantity: quantity})
        this._updateLineItem()
        this._trackQuantityChanged()
    }

    _onLineItemSetQty0 = () => {
        const {onChange, lineItem} = this.props
        const newLineItem = lineItem.set('quantity', 0)
        this.setState({quantity: 0})
        onChange(newLineItem)
    }

    _onRestockItemsChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({restock: event.target.checked})
        this._delayRestock(event.target.checked)
    }

    _delayRestock = _debounce((isChecked) => {
        const {onChange, lineItem} = this.props
        const newLineItem = lineItem.set('restock_item', isChecked)
        onChange(newLineItem)
    }, 100)

    _updateLineItem = _debounce(() => {
        const {onChange, lineItem} = this.props
        const {quantity} = this.state
        const newLineItem = lineItem.set('quantity', quantity)
        onChange(newLineItem)
    }, 800)

    _trackQuantityChanged = _debounce(() => {
        const {actionName} = this.props

        segmentTracker.logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_LINE_ITEM_QUANTITY_CHANGED
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_LINE_ITEM_QUANTITY_CHANGED
        )
    }, 1000)

    _renderImage() {
        const {product} = this.props
        const src =
            !!product && product.get('image')
                ? getSizedImageUrl(product.getIn(['image', 'src']), 'small')
                : defaultImage
        const alt = !!product ? product.getIn(['image', 'alt']) : ''

        return <img className={css.img} src={src} alt={alt} />
    }

    _renderTitle() {
        const {shopName, lineItem} = this.props
        const productId = lineItem.get('product_id') as string | null
        if (!productId) {
            return (
                <div>
                    <span className={css.title}>{lineItem.get('title')}</span>
                </div>
            )
        }

        const href = `https://${shopName}.myshopify.com/admin/products/${productId}`
        const variantId = lineItem.get('variant_id') as number | null

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
        const shouldRenderVariantTitle =
            !!variantTitle && variantTitle !== 'Default Title'
        const sku = lineItem.get('sku')

        return (
            <td className={css.container}>
                <div className={css.imgContainer}>{this._renderImage()}</div>
                <div className={css.legend}>
                    {this._renderTitle()}
                    {shouldRenderVariantTitle && (
                        <div className={css.subtitle}>{variantTitle}</div>
                    )}
                    {!!sku && <div className={css.subtitle}>SKU: {sku}</div>}
                </div>
            </td>
        )
    }

    _renderStock() {
        const {lineItem, product} = this.props
        const variantId = lineItem.get('variant_id')
        const variant = !!product
            ? ((product.get('variants', []) as List<any>).find(
                  (variant: Map<any, any>) => variant.get('id') === variantId
              ) as Map<any, any>)
            : null

        return (
            <td className={css.numberCol}>
                {!!variant && !!variant.get('inventory_management') ? (
                    <ProductStockQuantity
                        value={variant.get('inventory_quantity')}
                    />
                ) : (
                    <span className="text-muted">N/A</span>
                )}
            </td>
        )
    }

    _renderPrice() {
        const {
            lineItem,
            currencyCode,
            id,
            actionName,
            isShownInEditOrder,
        } = this.props

        const price = lineItem.get('price')
        const discountedPrice = getDraftOrderLineItemDiscountedPrice(
            lineItem,
            currencyCode
        )
        const formattedDiscountedPrice = formatPrice(
            discountedPrice,
            currencyCode
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
                                        currencyCode={currencyCode}
                                    />
                                </del>
                            </small>
                        )}
                        {isShownInEditOrder && lineItem.get('newly_added') && (
                            <DiscountPopover
                                id={`applied-discount-${id}`}
                                label="item"
                                editable
                                actionName={actionName}
                                currencyCode={currencyCode}
                                value={lineItem.get('applied_discount')}
                                max={parseFloat(price)}
                                onChange={this._onAppliedDiscountChange}
                            >
                                <MoneyAmount
                                    renderIfZero
                                    amount={formattedDiscountedPrice}
                                    currencyCode={currencyCode}
                                />
                            </DiscountPopover>
                        )}
                        {isShownInEditOrder && !lineItem.get('newly_added') && (
                            <MoneyAmount
                                renderIfZero
                                amount={formattedDiscountedPrice}
                                currencyCode={currencyCode}
                            />
                        )}
                        {!isShownInEditOrder && (
                            <DiscountPopover
                                id={`applied-discount-${id}`}
                                label="item"
                                editable
                                actionName={actionName}
                                currencyCode={currencyCode}
                                value={lineItem.get('applied_discount')}
                                max={parseFloat(price)}
                                onChange={this._onAppliedDiscountChange}
                            >
                                <MoneyAmount
                                    renderIfZero
                                    amount={formattedDiscountedPrice}
                                    currencyCode={currencyCode}
                                />
                            </DiscountPopover>
                        )}
                    </div>
                    <span className={css.times}>x</span>
                </div>
            </td>
        )
    }

    _renderQuantity() {
        const {quantity} = this.state
        const {lineItem, isShownInEditOrder} = this.props
        const min = !lineItem.get('newly_added') && isShownInEditOrder ? 0 : 1
        return (
            <td className={css.quantityCol}>
                <Input
                    type="number"
                    min={min}
                    value={quantity}
                    onChange={this._onQuantityChange}
                />
            </td>
        )
    }

    _renderTotal() {
        const {
            removable,
            lineItem,
            currencyCode,
            onDelete,
            isShownInEditOrder,
        } = this.props
        return (
            <td className={css.numberCol}>
                <div className="d-flex">
                    <strong
                        className={classnames('mt-auto mb-auto', 'mr-auto')}
                    >
                        <MoneyAmount
                            renderIfZero
                            amount={formatPrice(
                                getDraftOrderLineItemTotal(lineItem),
                                currencyCode
                            )}
                            currencyCode={currencyCode}
                        />
                    </strong>
                    {removable && !isShownInEditOrder && (
                        <Button
                            type="button"
                            color="link"
                            tabIndex={0}
                            className={classnames(css.delete, css.focusable)}
                            onClick={onDelete}
                        >
                            <i className="material-icons">close</i>
                        </Button>
                    )}
                </div>
            </td>
        )
    }
    _renderRestock() {
        const {lineItem, onDelete} = this.props
        const {restock} = this.state
        const shouldRestock =
            lineItem.get('initial_quantity') > lineItem.get('quantity')

        let clickFunc = onDelete

        if (!shouldRestock && !lineItem.get('newly_added'))
            clickFunc = this._onLineItemSetQty0

        return (
            <td className={classnames(css.numberCol, css.centered)}>
                {!shouldRestock && (
                    <Button
                        type="button"
                        color="link"
                        tabIndex={0}
                        className={classnames(css.delete, css.focusable)}
                        onClick={clickFunc}
                    >
                        <i className="material-icons">close</i>
                    </Button>
                )}

                {shouldRestock && !lineItem.get('newly_added') && (
                    <FormGroup check>
                        <Label check>
                            <Input
                                type="checkbox"
                                className={classnames(
                                    css.delete,
                                    css.focusable
                                )}
                                checked={restock}
                                onChange={this._onRestockItemsChange}
                            />
                            <span className="ml-1">
                                Restock{' '}
                                {lineItem.get('initial_quantity') -
                                    lineItem.get('quantity')}{' '}
                                item(s)
                            </span>
                        </Label>
                    </FormGroup>
                )}
            </td>
        )
    }

    render() {
        const {isShownInEditOrder} = this.props
        return (
            <tr>
                {this._renderProduct()}
                {this._renderStock()}
                {this._renderPrice()}
                {this._renderQuantity()}
                {this._renderTotal()}
                {isShownInEditOrder && this._renderRestock()}
            </tr>
        )
    }
}
