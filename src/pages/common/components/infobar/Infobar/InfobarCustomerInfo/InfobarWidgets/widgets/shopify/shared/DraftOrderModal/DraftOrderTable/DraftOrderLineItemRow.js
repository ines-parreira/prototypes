// @flow

import React from 'react'
import {Button, Input} from 'reactstrap'
import {type Record} from 'immutable'
import {getSizedImageUrl} from '@shopify/theme-images'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'

import {
    getDraftOrderLineItemDiscountedPrice,
    getDraftOrderLineItemTotal,
} from '../../../../../../../../../../../../business/shopify/lineItem'
import defaultImage from '../../../../../../../../../../../../../img/presentationals/shopify-product-default-image.png'
import * as segmentTracker from '../../../../../../../../../../../../store/middlewares/segmentTracker'
import * as Shopify from '../../../../../../../../../../../../constants/integrations/shopify'
import {formatPrice} from '../../../../../../../../../../../../business/shopify/number'
import DiscountPopover from '../DiscountPopover'
import MoneyAmount from '../../../../MoneyAmount'
import {ShopifyAction} from '../../../constants'

import css from './DraftOrderLineItemRow.less'

type Props = {
    id: string,
    actionName: string,
    lineItem: Record<$Shape<Shopify.LineItem>>,
    product: ?Record<Shopify.Product>,
    shopName: string,
    currencyCode: string,
    removable: boolean,
    onChange: (Record<$Shape<Shopify.LineItem>>) => void,
    onDelete: () => void,
}

type State = {
    quantity: number,
}

export class DraftOrderLineItemRow extends React.PureComponent<Props, State> {
    state = {
        quantity: this.props.lineItem.get('quantity'),
    }

    _onAppliedDiscountChange = (
        appliedDiscount: Record<$Shape<Shopify.AppliedDiscount>> | null
    ) => {
        const {onChange, lineItem} = this.props
        const newLineItem = lineItem.set('applied_discount', appliedDiscount)

        onChange(newLineItem)
    }

    _onQuantityChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value)
        const quantity = isNaN(value) ? 1 : value

        this.setState({quantity})
        this._updateLineItem()
        this._trackQuantityChanged()
    }

    _updateLineItem = _debounce(() => {
        const {onChange, lineItem} = this.props
        const {quantity} = this.state
        const newLineItem = lineItem.set('quantity', quantity)

        onChange(newLineItem)
    }, 250)

    _trackQuantityChanged = _debounce(() => {
        const {actionName} = this.props

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
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
        const productId = lineItem.get('product_id')
        if (!productId) {
            return (
                <div>
                    <span className={css.title}>{lineItem.get('title')}</span>
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

    _renderPrice() {
        const {lineItem, currencyCode, id, actionName} = this.props
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
                    </div>
                    <span className={css.times}>x</span>
                </div>
            </td>
        )
    }

    _renderQuantity() {
        const {quantity} = this.state

        return (
            <td className={css.quantityCol}>
                <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={this._onQuantityChange}
                />
            </td>
        )
    }

    _renderTotal() {
        const {removable, lineItem, currencyCode, onDelete} = this.props

        return (
            <td className={css.numberCol}>
                <div className="d-flex">
                    <strong
                        className={classnames(
                            'mt-auto mb-auto',
                            removable ? 'mr-auto' : 'ml-auto'
                        )}
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
                    {removable && (
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
