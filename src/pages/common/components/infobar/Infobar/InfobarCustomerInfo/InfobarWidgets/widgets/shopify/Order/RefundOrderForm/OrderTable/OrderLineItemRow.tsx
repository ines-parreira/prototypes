import React, {ChangeEvent, memo, useCallback, useState} from 'react'
import {Input, InputGroup, InputGroupAddon} from 'reactstrap'
import {Map} from 'immutable'
import classnames from 'classnames'
import {useDebounce} from 'react-use'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import {
    getOrderLineItemDiscountedPrice,
    getOrderLineItemPrice,
} from '../../../../../../../../../../../../business/shopify/lineItem'
import {formatPrice} from '../../../../../../../../../../../../business/shopify/number'
import MoneyAmount from '../../../../MoneyAmount'

import css from './OrderLineItemRow.less'

type Props = {
    index: number
    lineItem: Map<string, any>
    isRestockable: boolean | null
    shopName: string
    currencyCode: string
    shopCurrencyCode: string
    onChange: (lineItem: Map<string, any>, index: number) => void
}

function OrderLineItemRow({
    index,
    lineItem,
    isRestockable,
    shopName,
    currencyCode,
    shopCurrencyCode,
    onChange,
}: Props) {
    const [quantity, setQuantity] = useState<number>(lineItem.get('quantity'))
    const [maxQuantity] = useState<number>(lineItem.get('quantity'))

    const onQuantityChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = Number.parseInt(event.target.value, 10)
            let newQuantity = Number.isNaN(value) ? 0 : value

            if (newQuantity < 0) {
                newQuantity = 0
            } else if (newQuantity > maxQuantity) {
                newQuantity = maxQuantity
            }

            setQuantity(newQuantity)
        },
        [maxQuantity]
    )

    const onQuantityUp = useCallback(() => {
        setQuantity((previousQuantity) => previousQuantity + 1)
    }, [])

    const onQuantityDown = useCallback(() => {
        setQuantity((previousQuantity) => previousQuantity - 1)
    }, [])

    useDebounce(
        () => {
            if (quantity !== lineItem.get('quantity')) {
                onChange(lineItem.set('quantity', quantity), index)
            }
        },
        250,
        [quantity, lineItem, onChange, index]
    )

    const renderTitle = useCallback(() => {
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
    }, [lineItem, shopName])

    const renderProduct = useCallback(() => {
        const variantTitle = lineItem.get('variant_title')
        const shouldRenderVariantTitle =
            !!variantTitle && variantTitle !== 'Default Title'
        const sku = lineItem.get('sku')

        return (
            <td className={css.container}>
                <div className={css.legend}>
                    {renderTitle()}
                    {shouldRenderVariantTitle && (
                        <div className={css.subtitle}>{variantTitle}</div>
                    )}
                    {!!sku && <div className={css.subtitle}>SKU: {sku}</div>}
                    {!isRestockable && (
                        <div className="text-danger">
                            This product can't be restocked.
                        </div>
                    )}
                </div>
            </td>
        )
    }, [lineItem, renderTitle, isRestockable])

    const renderPrice = useCallback(() => {
        if (maxQuantity === 0) {
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
            maxQuantity
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
    }, [lineItem, maxQuantity, shopCurrencyCode])

    const renderQuantity = useCallback(() => {
        if (maxQuantity === 0) {
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
                            onChange={onQuantityChange}
                        />
                        <span className={css.quantityMax}>/ {maxQuantity}</span>
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
                            intent={ButtonIntent.Secondary}
                            isDisabled={quantity === maxQuantity}
                            onClick={onQuantityUp}
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
                            intent={ButtonIntent.Secondary}
                            isDisabled={quantity === 0}
                            onClick={onQuantityDown}
                        >
                            &#9660;
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </td>
        )
    }, [maxQuantity, quantity, onQuantityChange, onQuantityDown, onQuantityUp])

    const renderTotal = useCallback(() => {
        const discountedPrice = getOrderLineItemDiscountedPrice(
            lineItem,
            currencyCode,
            maxQuantity
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
    }, [currencyCode, maxQuantity, quantity, lineItem])

    return (
        <tr>
            {renderProduct()}
            {renderPrice()}
            {renderQuantity()}
            {renderTotal()}
        </tr>
    )
}

export default memo(OrderLineItemRow)
