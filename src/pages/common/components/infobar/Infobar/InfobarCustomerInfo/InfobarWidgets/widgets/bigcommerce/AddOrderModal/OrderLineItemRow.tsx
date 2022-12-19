import React, {memo, useEffect, useState} from 'react'

import {
    BigCommerceCartLineItem,
    BigCommerceProduct,
} from 'models/integration/types'

import ProductComponent from './ProductComponent'
import PriceComponent from './PriceComponent'
import {TotalPriceComponent} from './TotalPriceComponent'
import {QuantityComponent} from './QuantityComponent'

type Props = {
    id: string
    index: number
    lineItem: BigCommerceCartLineItem
    product?: BigCommerceProduct
    storeHash: string
    currencyCode: string | undefined
    removable: boolean
    onDelete: (index: number) => void
    onChange: (
        index: number,
        newQuantity: number,
        setQuantity: (quantity: number) => void
    ) => void
    hasError: boolean
}

function OrderLineItemRow({
    index,
    lineItem,
    product,
    storeHash,
    currencyCode,
    removable,
    onDelete,
    onChange,
    hasError,
}: Props) {
    const handleQuantityChange = (value: string) => {
        let newQuantity = Number.parseInt(value, 10)
        if (newQuantity < 1 || !newQuantity) {
            newQuantity = 1
        }
        setQuantity(newQuantity)
        onChange(index, newQuantity, setQuantity)
    }

    const [quantity, setQuantity] = useState<number>(1)

    useEffect(() => {
        setQuantity(lineItem.quantity)
    }, [lineItem.quantity])

    return (
        <tr>
            <ProductComponent
                product={product}
                lineItem={lineItem}
                storeHash={storeHash}
            />
            <PriceComponent lineItem={lineItem} currencyCode={currencyCode} />
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
        </tr>
    )
}

export default memo(OrderLineItemRow)
