import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'
import { getLineItemImageSrc } from '@repo/ecommerce/shopify/utils'

import type { OrderLineItem } from '../../../types'

import css from './OrderThumbnailStack.less'

type Props = {
    lineItems: OrderLineItem[]
    productsMap?: Map<number, OrderCardProduct>
}

export function OrderThumbnailStack({ lineItems, productsMap }: Props) {
    const hasOverflow = lineItems.length > 4
    const visible = hasOverflow ? lineItems.slice(0, 3) : lineItems.slice(0, 4)
    const overflowCount = lineItems.length - visible.length

    if (lineItems.length === 0) return null

    return (
        <div className={css.stack}>
            {visible.map((lineItem, index) => {
                const product =
                    lineItem.product_id && productsMap
                        ? productsMap.get(lineItem.product_id)
                        : undefined

                return (
                    <div key={lineItem.id ?? index} className={css.tile}>
                        <img
                            src={getLineItemImageSrc(lineItem, product)}
                            alt={lineItem.title}
                            className={css.image}
                        />
                    </div>
                )
            })}
            {hasOverflow && (
                <div className={css.overflowTile}>{`+${overflowCount}`}</div>
            )}
        </div>
    )
}
