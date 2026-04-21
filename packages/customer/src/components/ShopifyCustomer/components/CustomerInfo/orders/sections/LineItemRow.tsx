import { CopyableField } from '@repo/ecommerce/shopify/components'
import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'
import { getLineItemImageSrc } from '@repo/ecommerce/shopify/utils'

import { Box, Text } from '@gorgias/axiom'

import type { GroupedLineItem } from './groupOrderLineItems'

import css from '../sidePanel/OrderSidePanelPreview.less'

type Props = {
    item: GroupedLineItem
    productsMap?: Map<number, OrderCardProduct>
    moneySymbol: string
    isStrikethrough?: boolean
}

export function LineItemRow({
    item,
    productsMap,
    moneySymbol,
    isStrikethrough,
}: Props) {
    const { lineItem, quantity } = item
    const product =
        lineItem.product_id && productsMap
            ? productsMap.get(lineItem.product_id)
            : undefined

    return (
        <Box flexDirection="row" alignItems="flex-start" gap="xs" pb="md">
            <img
                src={getLineItemImageSrc(lineItem, product)}
                alt={lineItem.title}
                className={css.lineItemImage}
            />
            <Box flex={1} flexDirection="column">
                <CopyableField
                    value={lineItem.title}
                    ariaLabel="Copy product title"
                    inline
                >
                    <Text size="md">{lineItem.title}</Text>
                </CopyableField>
                {lineItem.sku && (
                    <CopyableField
                        value={lineItem.sku}
                        ariaLabel="Copy SKU"
                        inline
                    >
                        <Text size="md" className={css.label}>
                            SKU: {lineItem.sku}
                        </Text>
                    </CopyableField>
                )}
            </Box>

            <Box>
                <Text size="md" className={css.label}>
                    {quantity}x
                </Text>
            </Box>
            <Box flexDirection="column" alignItems="flex-end">
                <Text
                    size="md"
                    className={
                        isStrikethrough ? css.strikethroughPrice : undefined
                    }
                >
                    {moneySymbol}
                    {lineItem.price}
                </Text>
            </Box>
        </Box>
    )
}
