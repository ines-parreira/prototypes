import { CopyableField } from '@repo/ecommerce/shopify/components'
import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'
import { getLineItemImageSrc } from '@repo/ecommerce/shopify/utils'

import { Box, Text } from '@gorgias/axiom'

import type { GroupedLineItem } from '../../orders/sections/groupOrderLineItems'

import sharedCss from '../../orders/sidePanel/OrderSidePanelPreview.less'
import css from './LineItemRow.less'

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
    const hasVariant =
        !!lineItem.variant_title && lineItem.variant_title !== 'Default Title'
    const titleWithVariant = hasVariant
        ? `${lineItem.title} - ${lineItem.variant_title}`
        : lineItem.title

    return (
        <Box flexDirection="row" alignItems="flex-start" gap="xs" pb="md">
            <img
                src={getLineItemImageSrc(lineItem, product)}
                alt={lineItem.title}
                className={css.image}
            />
            <Box flex={1} flexDirection="column">
                <CopyableField
                    value={titleWithVariant}
                    ariaLabel="Copy product title"
                    inline
                >
                    <Text size="md">
                        {lineItem.title}
                        {hasVariant && (
                            <>
                                {' - '}
                                <span className={sharedCss.label}>
                                    {lineItem.variant_title}
                                </span>
                            </>
                        )}
                    </Text>
                </CopyableField>
                {lineItem.sku && (
                    <CopyableField
                        value={lineItem.sku}
                        ariaLabel="Copy SKU"
                        inline
                    >
                        <Text size="md" className={sharedCss.label}>
                            SKU: {lineItem.sku}
                        </Text>
                    </CopyableField>
                )}
            </Box>

            <Box>
                <Text size="md" className={sharedCss.label}>
                    {quantity}x
                </Text>
            </Box>
            <Box flexDirection="column" alignItems="flex-end">
                <Text
                    size="md"
                    className={
                        isStrikethrough
                            ? sharedCss.strikethroughPrice
                            : undefined
                    }
                >
                    {moneySymbol}
                    {lineItem.price}
                </Text>
            </Box>
        </Box>
    )
}
