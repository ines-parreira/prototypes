import React, {useCallback, useEffect, useState} from 'react'
import _debounce from 'lodash/debounce'

import {
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceProduct,
    BigCommerceCustomProduct,
} from 'models/integration/types'

import {OptionSelection} from 'models/integration/resources/bigcommerce'
import {isBigCommerceCartLineItem, isBigCommerceProduct} from '../../utils'
import {useEditModifiersPopover} from '../modifiers-popover/hooks'
import {modifierValuesToOptionSelections} from '../modifiers-popover/utils'
import ProductComponent from './ProductComponent'
import {TotalPriceComponent} from './TotalPriceComponent'
import {QuantityComponent} from './QuantityComponent'
import PriceComponent from './PriceComponent'

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
    }) => Promise<void>

    hasError: boolean
    onLineItemDiscount: (index: number, discountAmount: number) => void
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
    onLineItemDiscount,
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

    const handleDiscount = (newPrice: number) => {
        onLineItemDiscount(index, newPrice)
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
            />
            <PriceComponent
                lineItem={lineItem}
                currencyCode={currencyCode}
                handleDiscount={handleDiscount}
            />
            <QuantityComponent
                quantity={quantity}
                index={index}
                handleQuantityChange={handleQuantityChange}
                onDelete={onDelete}
                removable={removable}
                hasError={hasError}
            />
            <TotalPriceComponent
                currencyCode={currencyCode}
                lineItem={lineItem}
            />
            {modifiersPopover}
        </tr>
    )
}
