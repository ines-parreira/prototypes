import _debounce from 'lodash/debounce'
import React, {useCallback, useEffect, useState} from 'react'

import {OptionSelection} from 'models/integration/resources/bigcommerce'
import {
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceProduct,
    BigCommerceCustomProduct,
} from 'models/integration/types'

import {isBigCommerceCartLineItem, isBigCommerceProduct} from '../../utils'
import useEditModifiersPopover from '../modifiers-popover/useEditModifiersPopover'
import {modifierValuesToOptionSelections} from '../modifiers-popover/utils'
import PriceComponent from './PriceComponent'
import ProductComponent from './ProductComponent'
import {QuantityComponent} from './QuantityComponent'
import {TotalPriceComponent} from './TotalPriceComponent'

type Props = {
    id: string
    index: number
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem
    product: BigCommerceProduct | BigCommerceCustomProduct
    storeHash: string
    currencyCode: string | undefined
    removable: boolean
    onDelete: (index: number) => void
    onChange: (index: number, quantity: number) => Promise<void>
    onChangeModifiers: (props: {
        index: number
        quantity: number
        optionSelections: OptionSelection[]
        discounts: Map<string, number>
        setDiscounts: (value: Map<string, number>) => void
    }) => Promise<void>
    hasError: boolean
    errorMessage?: Maybe<string>
    onLineItemDiscount: (
        index: number,
        discountAmount: number,
        action: 'add' | 'remove'
    ) => void
    discounts: Map<string, number>
    setDiscounts: (value: Map<string, number>) => void
}

export default function OrderLineItemRow({
    index,
    lineItem,
    product,
    storeHash,
    currencyCode,
    removable,
    onDelete,
    onChange,
    onChangeModifiers,
    hasError,
    errorMessage,
    onLineItemDiscount,
    discounts,
    setDiscounts,
}: Props) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debounceOnChange = useCallback(
        _debounce(async (newQuantity: number, oldQuantity: number) => {
            try {
                await onChange(index, newQuantity)
            } catch (error) {
                setQuantity(oldQuantity)
            }
        }, 250),
        [index, onChange]
    )

    const handleQuantityChange = (value: string) => {
        if (product && !isBigCommerceProduct(product)) {
            // Custom Product - cannot update via API
            setQuantity(lineItem.quantity)
            void debounceOnChange(lineItem.quantity, lineItem.quantity)
            return
        }

        const oldQuantity = lineItem.quantity

        let newQuantity = Number.parseInt(value, 10)
        if (newQuantity < 1 || !newQuantity) {
            newQuantity = 1
        }

        setQuantity(newQuantity)

        void debounceOnChange(newQuantity, oldQuantity)
    }

    const {
        getReferenceProps,
        setReference,
        modifiersPopover,
        openModifierPopover,
    } = useEditModifiersPopover(storeHash, ({modifierValues}) => {
        const optionSelections =
            modifierValuesToOptionSelections(modifierValues)

        void onChangeModifiers({
            index,
            quantity: lineItem.quantity,
            optionSelections,
            discounts,
            setDiscounts,
        })
    })

    const handleOpenEditModifiers = () => {
        if (
            !product ||
            !isBigCommerceProduct(product) ||
            !isBigCommerceCartLineItem(lineItem)
        ) {
            return
        }

        openModifierPopover({
            product,
            lineItem,
        })
    }

    const handleDiscount = (newPrice: number, action: 'add' | 'remove') => {
        const lineItemID = lineItem.id
        if (action === 'add' && !discounts.has(lineItemID)) {
            discounts.set(lineItemID, lineItem.list_price)
        } else if (action === 'remove' && discounts.has(lineItemID)) {
            discounts.delete(lineItemID)
        }
        setDiscounts(discounts)
        onLineItemDiscount(index, newPrice, action)
    }

    const [quantity, setQuantity] = useState<number>(1)

    useEffect(() => {
        setQuantity(lineItem.quantity)
    }, [lineItem.quantity])

    return (
        <tr {...getReferenceProps()} ref={setReference}>
            <ProductComponent
                product={product}
                lineItem={lineItem}
                storeHash={storeHash}
                onOpenModifiers={handleOpenEditModifiers}
                errorMessage={errorMessage}
            />
            <PriceComponent
                lineItem={lineItem}
                currencyCode={currencyCode}
                handleDiscount={handleDiscount}
                discounts={discounts}
            />
            <QuantityComponent
                quantity={quantity}
                index={index}
                handleQuantityChange={handleQuantityChange}
                onDelete={onDelete}
                removable={removable}
                hasError={hasError}
                readOnly={!isBigCommerceCartLineItem(lineItem)}
            />
            <TotalPriceComponent
                currencyCode={currencyCode}
                lineItem={lineItem}
            />
            {modifiersPopover}
        </tr>
    )
}
