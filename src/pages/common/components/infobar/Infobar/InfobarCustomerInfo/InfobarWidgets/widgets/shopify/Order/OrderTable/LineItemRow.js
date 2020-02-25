// @flow

import React from 'react'
import {Button, Input} from 'reactstrap'
import {type Record} from 'immutable'
import {getSizedImageUrl} from '@shopify/theme-images'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'

import defaultImage from '../../../../../../../../../../../../img/presentationals/shopify-product-default-image.png'
import * as segmentTracker from '../../../../../../../../../../../store/middlewares/segmentTracker'
import * as Shopify from '../../../../../../../../../../../constants/integrations/shopify'
import {
    formatPrice,
    getLineItemDiscountedPrice,
    getLineItemTotal,
} from '../../../../../../../../../../../business/shopify/order'
import ShopifyMoneyAmount from '../MoneyAmount'

import css from './LineItemRow.less'

type Props = {
    lineItem: Record<$Shape<Shopify.LineItem>>,
    product: ?Record<Shopify.Product>,
    shopName: string,
    currencyCode: string,
    editable: boolean,
    removable: boolean,
    onChange: (Record<$Shape<Shopify.LineItem>>) => void,
    onDelete: () => void,
}

type State = {
    quantity: number,
}

export class LineItemRow extends React.PureComponent<Props, State> {
    static defaultProps = {
        removable: false,
    }

    state = {
        quantity: this.props.lineItem.get('quantity')
    }

    _onQuantityChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const quantity = parseInt(event.target.value) || 1

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
        segmentTracker.logEvent(segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_LINE_ITEM_QUANTITY_CHANGED)
    }, 1000)

    _renderImage() {
        const {product} = this.props
        const src = !!product && product.get('image')
            ? getSizedImageUrl(product.getIn(['image', 'src']), 'small')
            : defaultImage
        const alt = !!product ? product.getIn(['image', 'alt']) : ''

        return (
            <img
                className={css.img}
                src={src}
                alt={alt}
            />
        )
    }

    _renderTitle() {
        const {shopName, product, lineItem} = this.props
        if (!product) {
            return (
                <div className={css.title}>
                    {lineItem.get('title')}
                </div>
            )
        }

        const href = `https://${shopName}.myshopify.com/admin/products/${product.get('id')}`
        const variantId = lineItem.get('variant_id')

        return (
            <a
                className={css.title}
                href={!!variantId ? `${href}/variants/${variantId}` : href}
                target="_blank"
                rel="noopener noreferrer"
            >
                {lineItem.get('title')}
            </a>
        )
    }

    render() {
        const {editable, removable, lineItem, currencyCode, onDelete} = this.props
        const {quantity} = this.state
        const variantTitle = lineItem.get('variant_title')
        const shouldDisplayVariantTitle = !!variantTitle && variantTitle !== 'Default Title'
        const sku = lineItem.get('sku')

        return (
            <tr>
                <td className={css.container}>
                    <div className={css.imgContainer}>
                        {this._renderImage()}
                    </div>
                    <div className={css.legend}>
                        {this._renderTitle()}
                        {shouldDisplayVariantTitle && <div className={css.subtitle}>{variantTitle}</div>}
                        {!!sku && <div className={css.subtitle}>SKU: {sku}</div>}
                    </div>
                </td>
                <td className={css.numberCol}>
                    <div className="d-flex">
                        <div className="d-inline-block text-center">
                            {!!lineItem.get('applied_discount') && (
                                <small className="d-block text-muted">
                                    <ShopifyMoneyAmount
                                        renderIfZero
                                        amount={lineItem.get('price')}
                                        currencyCode={currencyCode}
                                    />
                                </small>
                            )}
                            <ShopifyMoneyAmount
                                renderIfZero
                                amount={formatPrice(getLineItemDiscountedPrice(lineItem))}
                                currencyCode={currencyCode}
                            />
                        </div>
                        <span className={css.times}>x</span>
                    </div>
                </td>
                <td className={css.quantityCol}>
                    <Input
                        type="number"
                        min={1}
                        value={quantity}
                        disabled={!editable}
                        onChange={this._onQuantityChange}
                    />
                </td>
                <td className={css.numberCol}>
                    <strong>
                        <ShopifyMoneyAmount
                            renderIfZero
                            amount={formatPrice(getLineItemTotal(lineItem))}
                            currencyCode={currencyCode}
                        />
                    </strong>
                    {editable && removable && (
                        <Button
                            type="button"
                            color="link"
                            tabIndex={0}
                            className={classnames(css.delete, css.focusable)}
                            onClick={onDelete}
                        >
                            <i className="material-icons">
                                close
                            </i>
                        </Button>
                    )}
                </td>
            </tr>
        )
    }
}
