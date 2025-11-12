import React, { memo, RefObject, useCallback, useEffect, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'
import { fromJS, List, Map } from 'immutable'
import _debounce from 'lodash/debounce'

import defaultImage from 'assets/img/presentationals/shopify-product-default-image.png'
import {
    getDraftOrderLineItemDiscountedPrice,
    getDraftOrderLineItemTotal,
} from 'business/shopify/lineItem'
import { formatPrice } from 'business/shopify/number'
import { shopifyAdminBaseUrl } from 'config/integrations/shopify'
import IconButton from 'pages/common/components/button/IconButton'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import { ProductStockQuantity } from 'pages/common/components/StockQuantity'
import CheckBox from 'pages/common/forms/CheckBox'
import NumberInput from 'pages/common/forms/input/NumberInput'
import { getSizedImageUrl } from 'utils/shopify'
import DiscountPopover from 'Widgets/modules/Shopify/modules/DiscountPopover'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import css from './OrderLineItemRow.less'

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
    container?: RefObject<HTMLDivElement>
}

const debouncedRestock = _debounce(
    (
        restock: boolean,
        lineItem: Map<any, any>,
        index: number,
        onChange: onChange,
        callback?: () => void,
    ) => {
        const newLineItem = lineItem.set('restock_item', restock)
        onChange(newLineItem, index)
        callback?.()
    },
    100,
)

const debouncedUpdateLineItem = _debounce(
    (
        newQuantity,
        lineItem: Map<any, any>,
        index: number,
        onChange: onChange,
        actionName,
        callback?: () => void,
    ) => {
        const newLineItem = lineItem.set('quantity', newQuantity)
        onChange(newLineItem, index)
        let action
        switch (actionName) {
            case ShopifyActionType.CreateOrder:
                action = SegmentEvent.ShopifyCreateOrderLineItemQuantityChanged
                break
            case ShopifyActionType.DuplicateOrder:
                action =
                    SegmentEvent.ShopifyDuplicateOrderLineItemQuantityChanged
                break
            case ShopifyActionType.EditOrder:
                action = SegmentEvent.ShopifyEditOrderLineItemQuantityChanged
                break
        }
        logEvent(action as SegmentEvent)
        callback?.()
    },
    400,
)

function OrderLineItemRow({
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
    container,
}: Props) {
    const [quantity, setQuantity] = useState<number>(lineItem.get('quantity'))
    const [restock, setRestock] = useState<boolean>(
        lineItem.get('restock_item', false),
    )
    const [isWaitingForUpdate, setWaitingForUpdate] = useState(false)

    const lineItemQuantity = lineItem.get('quantity')
    useEffect(() => setQuantity(lineItemQuantity), [lineItemQuantity])
    const handleRestockItemsChange = useCallback(
        (newValue: boolean) => {
            setRestock(newValue)
            setWaitingForUpdate(true)
            debouncedRestock(newValue, lineItem, index, onChange, () =>
                setWaitingForUpdate(false),
            )
        },
        [index, lineItem, onChange],
    )

    const handleQuantityChange = useCallback(
        (value?: number) => {
            const min =
                !lineItem.get('newly_added') && isShownInEditOrder ? 0 : 1

            let newQuantity = value || 1
            if (newQuantity < min) newQuantity = min
            setQuantity(newQuantity)
            setWaitingForUpdate(true)
            debouncedUpdateLineItem(
                newQuantity,
                lineItem,
                index,
                onChange,
                actionName,
                () => setWaitingForUpdate(false),
            )
        },
        [lineItem, isShownInEditOrder, index, onChange, actionName],
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
                appliedDiscount,
            )
            onChange(newLineItem, index)
        },
        [lineItem, index, onChange],
    )

    const renderImage = useCallback(() => {
        let imageSrc = ''
        const variant_id = lineItem.get('variant_id')
        const variantImage: Map<any, any> =
            product &&
            (product.get('images', fromJS([])) as List<any>).find(
                (image: Map<any, any>) =>
                    (
                        image.get('variant_ids', fromJS([])) as List<any>
                    ).includes(variant_id),
            )
        const variantImageSrc = variantImage ? variantImage.get('src') : ''
        if (variantImageSrc) {
            imageSrc = variantImageSrc
        } else {
            imageSrc =
                !!product && product.get('image')
                    ? getSizedImageUrl(product.getIn(['image', 'src']), 'small')
                    : defaultImage
        }
        const alt = !!product ? product.getIn(['image', 'alt']) : ''

        return <img className={css.img} src={imageSrc} alt={alt} />
    }, [lineItem, product])

    const renderTitle = useCallback(() => {
        const productId = lineItem.get('product_id') as string | null
        if (!productId) {
            return (
                <div>
                    <span className={css.title}>{lineItem.get('title')}</span>
                </div>
            )
        }

        const href = `${shopifyAdminBaseUrl(shopName)}/products/${productId}`
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
                  (variant: Map<any, any>) => variant.get('id') === variantId,
              ) as Map<any, any>)
            : null

        const isTracked =
            variant &&
            (!!variant.get('inventory_management') || variant.get('tracked'))

        return (
            <td className={css.numberCol}>
                {!!variant && isTracked ? (
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
            currencyCode,
        )
        const formattedDiscountedPrice = formatPrice(
            discountedPrice,
            currencyCode,
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
                                container={container}
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
                                container={container}
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
        container,
    ])

    const renderQuantity = useCallback(() => {
        const min = !lineItem.get('newly_added') && isShownInEditOrder ? 0 : 1
        return (
            <td className={css.quantityCol}>
                <NumberInput
                    min={min}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className={css.numberInput}
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
                                currencyCode,
                            )}
                            currencyCode={currencyCode}
                        />
                    </strong>
                    {removable && !isShownInEditOrder && (
                        <IconButton
                            fillStyle="ghost"
                            intent="destructive"
                            tabIndex={0}
                            onClick={() => onDelete(index)}
                            isDisabled={isWaitingForUpdate}
                        >
                            close
                        </IconButton>
                    )}
                </div>
            </td>
        )
    }, [
        currencyCode,
        index,
        isShownInEditOrder,
        lineItem,
        onDelete,
        removable,
        isWaitingForUpdate,
    ])

    const renderRestock = useCallback(() => {
        const shouldRestock =
            lineItem.get('initial_quantity') > lineItem.get('quantity')

        const clickFunc = lineItem.get('newly_added')
            ? () => onDelete(index)
            : handleSetQuantityTo0

        return (
            <td className={classnames(css.numberCol, css.centered)}>
                {!shouldRestock && (
                    <IconButton
                        fillStyle="ghost"
                        intent="destructive"
                        tabIndex={0}
                        onClick={clickFunc}
                    >
                        close
                    </IconButton>
                )}

                {shouldRestock && !lineItem.get('newly_added') && (
                    <CheckBox
                        className={classnames(css.delete, css.focusable)}
                        isChecked={restock}
                        onChange={handleRestockItemsChange}
                    >
                        Restock{' '}
                        {lineItem.get('initial_quantity') -
                            lineItem.get('quantity')}{' '}
                        item(s)
                    </CheckBox>
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

export default memo(OrderLineItemRow)
