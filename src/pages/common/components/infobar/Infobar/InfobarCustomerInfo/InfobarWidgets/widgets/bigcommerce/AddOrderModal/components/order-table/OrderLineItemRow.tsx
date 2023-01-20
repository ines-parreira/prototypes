import React, {useEffect, useState} from 'react'

import {
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceProduct,
    BigCommerceCustomProduct,
} from 'models/integration/types'

import {isBigCommerceProduct} from '../../utils'
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
    onChange: (
        index: number,
        newQuantity: number,
        setQuantity: (quantity: number) => void
    ) => void
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
    hasError,
    onLineItemDiscount,
}: Props) {
    const handleQuantityChange = (value: string) => {
        if (product && !isBigCommerceProduct(product)) {
            // Custom Product - cannot update via API
            setQuantity(lineItem.quantity)
            onChange(index, lineItem.quantity, setQuantity)
            return
        }

        let newQuantity = Number.parseInt(value, 10)
        if (newQuantity < 1 || !newQuantity) {
            newQuantity = 1
        }
        setQuantity(newQuantity)
        onChange(index, newQuantity, setQuantity)
    }

    const handleDiscount = (newPrice: number) => {
        onLineItemDiscount(index, newPrice)
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
        </tr>
    )
}
