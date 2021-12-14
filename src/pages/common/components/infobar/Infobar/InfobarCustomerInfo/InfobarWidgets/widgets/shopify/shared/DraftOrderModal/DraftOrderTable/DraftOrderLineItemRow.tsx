import React, {ChangeEvent, memo, useCallback, useState} from 'react'
import {Button, Input, Label, FormGroup} from 'reactstrap'
import {Map, List} from 'immutable'
import {getSizedImageUrl} from '@shopify/theme-images'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'

import defaultImage from 'assets/img/presentationals/shopify-product-default-image.png'

import {
    getDraftOrderLineItemDiscountedPrice,
    getDraftOrderLineItemTotal,
} from '../../../../../../../../../../../../business/shopify/lineItem'
import * as segmentTracker from '../../../../../../../../../../../../store/middlewares/segmentTracker.js'
import {formatPrice} from '../../../../../../../../../../../../business/shopify/number'
import {ProductStockQuantity} from '../../StockQuantity'
import DiscountPopover from '../DiscountPopover/DiscountPopover'
import MoneyAmount from '../../../../MoneyAmount'
import {ShopifyActionType} from '../../../types'

import css from './DraftOrderLineItemRow.less'

type onChange = (record: Map<any, any>, index: number) => void

type Props = {
    id: string
    index: number
    actionName: ShopifyActionType
    isShownInEditOrder: boolean
    lineItem: Map<any, any>
    product?: Map<any, any> | null
    shopName: string
    currencyCode: string
    removable: boolean
    onChange: onChange
    onDelete: (index: number) => void
}

const debouncedRestock = _debounce(
    (
        restock: boolean,
        lineItem: Map<any, any>,
        index: number,
        onChange: onChange
    ) => {
        const newLineItem = lineItem.set('restock_item', restock)
        onChange(newLineItem, index)
    },
    100
)

const debouncedUpdateLineItem = _debounce(
    (
        newQuantity,
        lineItem: Map<any, any>,
        index: number,
        onChange: onChange,
        actionName
    ) => {
        const newLineItem = lineItem.set('quantity', newQuantity)
        onChange(newLineItem, index)
        let action
        switch (actionName) {
            case ShopifyActionType.CreateOrder:
                action =
                    segmentTracker.EVENTS
                        .SHOPIFY_CREATE_ORDER_LINE_ITEM_QUANTITY_CHANGED
                break
            case ShopifyActionType.DuplicateOrder:
                action =
                    segmentTracker.EVENTS
                        .SHOPIFY_DUPLICATE_ORDER_LINE_ITEM_QUANTITY_CHANGED
                break
            case ShopifyActionType.EditOrder:
                action =
                    segmentTracker.EVENTS
                        .SHOPIFY_EDIT_ORDER_LINE_ITEM_QUANTITY_CHANGED
                break
        }
        segmentTracker.logEvent(action)
    },
    800
)

function DraftOrderLineItemRow({
    id,
    index,
    actionName,
    isShownInEditOrder,
    lineItem,
    product = null,
    shopName,
    currencyCode,
    removable,
    onChange,
    onDelete,
}: Props) {
    const [quantity, setQuantity] = useState<number>(lineItem.get('quantity'))
    const [restock, setRestock] = useState<boolean>(
        lineItem.get('restock_item', false)
    )

    const handleRestockItemsChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setRestock(event.target.checked)
            debouncedRestock(event.target.checked, lineItem, index, onChange)
        },
        [index, lineItem, onChange]
    )
    const handleQuantityChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const min =
                !lineItem.get('newly_added') && isShownInEditOrder ? 0 : 1
            const value = Number.parseInt(event.target.value, 10)
            let newQuantity = Number.isNaN(value) ? 1 : value
            if (newQuantity < min) newQuantity = min
            setQuantity(newQuantity)
            debouncedUpdateLineItem(
                newQuantity,
                lineItem,
                index,
                onChange,
                actionName
            )
        },
        [lineItem, isShownInEditOrder, index, onChange, actionName]
    )

    const handleSetQuantityTo0 = useCallback(() => {
        setQuantity(0)
        const newLineItem = lineItem.set('quantity', 0)
        onChange(newLineItem, index)
    }, [lineItem, index, onChange])

    const handleAppliedDiscountChange = useCallback(
        (appliedDiscount: Map<any, any> | null) => {
            const newLineItem = lineItem.set(
                'applied_discount',
                appliedDiscount
            )
            onChange(newLineItem, index)
        },
        [lineItem, index, onChange]
    )

    const renderImage = useCallback(() => {
        const src =
            !!product && product.get('image')
                ? getSizedImageUrl(product.getIn(['image', 'src']), 'small')
                : defaultImage
        const alt = !!product ? product.getIn(['image', 'alt']) : ''

        return <img className={css.img} src={src} alt={alt} />
    }, [product])

    const renderTitle = useCallback(() => {
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
    }, [lineItem, shopName])

    const renderProduct = useCallback(() => {
        const variantTitle = lineItem.get('variant_title')
        const shouldRenderVariantTitle =
            !!variantTitle && variantTitle !== 'Default Title'
        const sku = lineItem.get('sku')

        return (
            <td className={css.container}>
                <div className={css.imgContainer}>{renderImage()}</div>
                <div className={css.legend}>
                    {renderTitle()}
                    {shouldRenderVariantTitle && (
                        <div className={css.subtitle}>{variantTitle}</div>
                    )}
                    {!!sku && <div className={css.subtitle}>SKU: {sku}</div>}
                </div>
            </td>
        )
    }, [lineItem, renderImage, renderTitle])

    const renderStock = useCallback(() => {
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
    }, [product, lineItem])

    const renderPrice = useCallback(() => {
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
                                onChange={handleAppliedDiscountChange}
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
                                onChange={handleAppliedDiscountChange}
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
    }, [
        handleAppliedDiscountChange,
        actionName,
        currencyCode,
        id,
        isShownInEditOrder,
        lineItem,
    ])

    const renderQuantity = useCallback(() => {
        const min = !lineItem.get('newly_added') && isShownInEditOrder ? 0 : 1
        return (
            <td className={css.quantityCol}>
                <Input
                    type="number"
                    min={min}
                    value={quantity}
                    onChange={handleQuantityChange}
                />
            </td>
        )
    }, [handleQuantityChange, isShownInEditOrder, lineItem, quantity])

    const renderTotal = useCallback(() => {
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
                            onClick={() => onDelete(index)}
                        >
                            <i className="material-icons">close</i>
                        </Button>
                    )}
                </div>
            </td>
        )
    }, [currencyCode, index, isShownInEditOrder, lineItem, onDelete, removable])

    const renderRestock = useCallback(() => {
        const shouldRestock =
            lineItem.get('initial_quantity') > lineItem.get('quantity')

        const clickFunc = lineItem.get('newly_added')
            ? () => onDelete(index)
            : handleSetQuantityTo0

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
                                onChange={handleRestockItemsChange}
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
    }, [
        handleSetQuantityTo0,
        handleRestockItemsChange,
        index,
        lineItem,
        onDelete,
        restock,
    ])
    return (
        <tr>
            {renderProduct()}
            {renderStock()}
            {renderPrice()}
            {renderQuantity()}
            {renderTotal()}
            {isShownInEditOrder && renderRestock()}
        </tr>
    )
}

export default memo(DraftOrderLineItemRow)
